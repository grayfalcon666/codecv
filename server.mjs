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

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('payload too large')
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
