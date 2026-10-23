// codecv 单容器服务：同一进程里服务 dist 静态文件 + 简历保存接口
// 零依赖，仅使用 Node 内置模块。用法：node server.mjs
// 环境变量：
//   PORT        监听端口（默认 80）
//   RESUME_DIR  简历 .md 存放目录（默认 /app/resumes，Docker 里挂载卷持久化）
//   RESUME_TOKEN 可选。设置后 /api/* 请求必须携带 Authorization: Bearer <RESUME_TOKEN>
import { createServer } from 'http'
import { promises as fs, existsSync, statSync, createReadStream } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '80', 10)
// 默认绑 127.0.0.1：WSL2 下 Windows 浏览器只能经 localhost 转发访问绑定回环地址的服务；
// Docker 里由 Dockerfile 的 ENV HOST=0.0.0.0 覆盖（否则容器端口映射不生效）
const HOST = process.env.HOST || '127.0.0.1'
// Docker 里由 Dockerfile 的 ENV RESUME_DIR=/app/resumes 覆盖；本地跑默认用仓库下的 resumes/ 目录
const RESUME_DIR = process.env.RESUME_DIR || path.join(__dirname, 'resumes')
const DIST_DIR = path.join(__dirname, 'dist')
const TOKEN = process.env.RESUME_TOKEN || ''
const MAX_BODY = 5 * 1024 * 1024

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType })
  res.end(text)
}

function sendCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

// 文件名清洗：去首尾空格、去 .md 后缀、剔除控制字符与路径分隔符、禁前导点和 ..（防路径穿越）
// 采用黑名单而非白名单：逗号、括号等常见于简历名的字符都应放行
function sanitizeName(raw) {
  if (typeof raw !== 'string') return null
  const name = raw
    .trim()
    .replace(/\.md$/i, '')
    .replace(/[\x00-\x1f/\\]/g, '')
  if (!name || name.length > 100) return null
  if (name.startsWith('.') || name === '..') return null
  return name
}

// 简历元数据（每份简历对应的模板类型），存放在 RESUME_DIR/meta.json
const META_FILE = path.join(RESUME_DIR, 'meta.json')

async function readMeta() {
  try {
    return JSON.parse(await fs.readFile(META_FILE, 'utf8'))
  } catch {
    return {}
  }
}

async function writeMeta(meta) {
  await fs.writeFile(META_FILE, JSON.stringify(meta), 'utf8')
}

async function readBody(req, max = MAX_BODY) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > max) throw new Error('payload too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

// 处理 /api/resume/*；返回 true 表示已处理，false 表示不是已知接口
async function handleApi(req, res, url) {
  sendCORS(res)
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return true
  }
  if (TOKEN && req.headers.authorization !== `Bearer ${TOKEN}`) {
    sendJSON(res, 401, { error: 'unauthorized' })
    return true
  }

  // 列表
  if (req.method === 'GET' && url.pathname === '/api/resume/list') {
    const meta = await readMeta()
    const files = []
    for (const f of await fs.readdir(RESUME_DIR)) {
      if (!f.endsWith('.md')) continue
      const name = f.slice(0, -3)
      const st = await fs.stat(path.join(RESUME_DIR, f))
      files.push({ name, size: st.size, mtime: st.mtimeMs, type: (meta[name] || {}).type || '' })
    }
    files.sort((a, b) => b.mtime - a.mtime)
    sendJSON(res, 200, files)
    return true
  }

  // 保存（同名覆盖）
  if (req.method === 'POST' && url.pathname === '/api/resume/save') {
    let body
    try {
      body = JSON.parse(await readBody(req))
    } catch {
      sendJSON(res, 400, { error: '请求体必须是合法 JSON' })
      return true
    }
    const name = sanitizeName(body && body.name)
    if (!name) {
      sendJSON(res, 400, {
        error: '文件名不合法（不能为空、不能含路径分隔符、最长100字符）'
      })
      return true
    }
    if (typeof body.content !== 'string') {
      sendJSON(res, 400, { error: 'content 必须是字符串' })
      return true
    }
    await fs.writeFile(path.join(RESUME_DIR, `${name}.md`), body.content, 'utf8')
    const meta = await readMeta()
    meta[name] = { type: typeof body.type === 'string' ? body.type : '' }
    await writeMeta(meta)
    sendJSON(res, 200, { ok: true, name })
    return true
  }

  // 读取 / 删除
  const isGet = req.method === 'GET' && url.pathname === '/api/resume/get'
  const isDelete = req.method === 'DELETE' && url.pathname === '/api/resume/delete'
  if (isGet || isDelete) {
    const name = sanitizeName(url.searchParams.get('name') || '')
    if (!name) {
      sendJSON(res, 400, { error: '非法文件名' })
      return true
    }
    const filePath = path.join(RESUME_DIR, `${name}.md`)
    if (isGet) {
      let content
      try {
        content = await fs.readFile(filePath, 'utf8')
      } catch {
        sendJSON(res, 404, { error: '简历不存在' })
        return true
      }
      const meta = await readMeta()
      sendJSON(res, 200, { name, content, type: (meta[name] || {}).type || '' })
      return true
    }
    if (!existsSync(filePath)) {
      sendJSON(res, 404, { error: '简历不存在' })
      return true
    }
    await fs.unlink(filePath)
    const meta = await readMeta()
    delete meta[name]
    await writeMeta(meta)
    sendJSON(res, 200, { ok: true })
    return true
  }

  // PDF/PNG 导出（内置 Playwright 无头浏览器，未安装时返回 501 提示）
  if (req.method === 'POST' && url.pathname === '/api/pdf/export') {
    let body
    try {
      body = JSON.parse(await readBody(req, PDF_MAX_BODY))
    } catch (e) {
      if (e?.message === 'payload too large') {
        sendJSON(res, 413, { error: '请求体过大（最大 20MB）' })
      } else {
        sendJSON(res, 400, { error: '请求体必须是合法 JSON' })
      }
      return true
    }
    const content = typeof body.content === 'string' ? body.content : ''
    if (!content.trim()) {
      sendJSON(res, 400, { error: 'content 不能为空' })
      return true
    }
    let browser
    try {
      browser = await getBrowser()
    } catch (e) {
      console.error('browser launch failed:', e?.message)
      sendJSON(res, 501, {
        error:
          '浏览器内核未安装：' +
          (e?.message || '未知错误') +
          '（Docker 镜像自带；本地开发请执行 npx playwright-core install --with-deps chromium-headless-shell）'
      })
      return true
    }
    if (!browser) {
      sendJSON(res, 501, {
        error: '服务器未安装 playwright-core（Docker 镜像自带；本地开发请 yarn add -D playwright-core）'
      })
      return true
    }
    const style = typeof body.style === 'string' ? body.style : ''
    // 生产环境前端传 link（模板 CSS chunk 的绝对 URL，如 http://host/css/style-xxx.css），
    // 取 pathname 后直接从自己的 dist 读取内联（模板样式不进 PDF 等于导出白板）
    let linkCSS = ''
    const link = typeof body.link === 'string' ? body.link : ''
    if (link && link !== 'none') {
      let pathname = link.startsWith('/') ? link : ''
      if (!pathname) {
        try {
          pathname = new URL(link).pathname
        } catch {
          pathname = ''
        }
      }
      if (pathname.startsWith('/')) linkCSS = (await readDistFile(pathname)) || ''
    }
    try {
      const result = await withRenderSlot(async () => {
        const page = await browser.newPage()
        try {
          await page.setContent(buildRenderHTML(content, linkCSS, style), { waitUntil: 'load' })
          await page.evaluate(() => document.fonts.ready)
          if (body.type === 1) {
            const png = await page.screenshot({ fullPage: true, type: 'png' })
            return { picture: { data: [...png] } }
          }
          const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true })
          return { pdf: { data: [...pdf] } }
        } finally {
          await page.close()
        }
      })
      sendJSON(res, 200, result)
    } catch (e) {
      console.error('pdf export failed:', e?.message)
      sendJSON(res, 500, { error: '导出失败：' + (e?.message || '未知错误') })
    }
    return true
  }

  return false
}

// 静态文件服务（dist/）；非文件路径回退到 index.html
function serveStatic(res, url) {
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return sendText(res, 400, 'bad request')
  }
  if (pathname === '/') pathname = '/index.html'
  const filePath = path.resolve(DIST_DIR, '.' + pathname)
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) {
    return sendText(res, 403, 'forbidden')
  }
  let target = filePath
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    if (path.extname(filePath)) return sendText(res, 404, 'not found')
    target = path.join(DIST_DIR, 'index.html')
  }
  const ext = path.extname(target).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  createReadStream(target).pipe(res)
}

// ---------- PDF/PNG 导出（Playwright 无头浏览器，可选依赖）----------
// 零依赖原则：playwright-core 未安装时本模块 import 失败，导出接口返回 501，其余功能不受影响
const PDF_MAX_BODY = 20 * 1024 * 1024 // 简历 HTML 可能内联 base64 头像，比保存接口放宽
const MAX_CONCURRENT_RENDERS = 2

let playwright = null
let browserPromise = null
let renderQueue = 0

async function getBrowser() {
  if (playwright === null) {
    try {
      playwright = await import('playwright-core')
    } catch {
      playwright = false
    }
  }
  if (!playwright) return null
  if (!browserPromise) {
    browserPromise = playwright.chromium
      .launch({
        // 容器内运行必需：无沙箱（userns 受限）+ 大页面需要更多共享内存
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      })
      .catch(err => {
        browserPromise = null
        throw err
      })
  }
  return browserPromise
}

async function closeBrowser() {
  if (browserPromise) {
    try {
      ;(await browserPromise).close()
    } catch {
      // 关闭失败不影响退出
    }
  }
}

// 简易信号量：限制同时渲染的页面数，防止大简历把单容器拖垮
async function withRenderSlot(fn) {
  while (renderQueue >= MAX_CONCURRENT_RENDERS) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  renderQueue++
  try {
    return await fn()
  } finally {
    renderQueue--
  }
}

// 从自己的 dist 读取静态文件（link 是构建产物的 CSS chunk 路径，与当前镜像内的 dist 自洽）
// 注意必须是 async + await：不 await 时 rejection 不会被 try/catch 捕获，会直接穿透成 500
async function readDistFile(pathname) {
  try {
    pathname = decodeURIComponent(String(pathname).split(/[?#]/)[0])
  } catch {
    return null
  }
  if (pathname === '/') pathname = '/index.html'
  const filePath = path.resolve(DIST_DIR, '.' + pathname)
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) return null
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

// 组装待渲染页面：<base> 指向自身，让页面里的相对路径资源（头像/字体等）走本服务
function buildRenderHTML(content, linkCSS, style) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<base href="http://127.0.0.1:${PORT}/">
<style>${linkCSS}</style>
<style>${style}</style>
<style>
/* 容器内安装的是 Noto Sans/Serif CJK，别名映射让模板的字体名精确命中（离线可用，不依赖 Google Fonts） */
@font-face{font-family:'Noto Sans SC';src:local('Noto Sans CJK SC')}
@font-face{font-family:'Noto Serif SC';src:local('Noto Serif CJK SC')}
html,body{margin:0;padding:0}
</style>
</head>
<body>${content}</body>
</html>`
}

process.on('SIGINT', async () => {
  await closeBrowser()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await closeBrowser()
  process.exit(0)
})

await fs.mkdir(RESUME_DIR, { recursive: true })

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    if (url.pathname.startsWith('/api/')) {
      if (await handleApi(req, res, url)) return
      return sendJSON(res, 404, { error: '接口不存在' })
    }
    if (req.method !== 'GET') return sendText(res, 405, 'method not allowed')
    serveStatic(res, url)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) sendJSON(res, 500, { error: 'server error' })
  }
}).listen(PORT, HOST, () => {
  console.log(`codecv server listening on :${PORT}`)
  console.log(`resume dir: ${RESUME_DIR}`)
  console.log(`static dir: ${DIST_DIR}`)
})
