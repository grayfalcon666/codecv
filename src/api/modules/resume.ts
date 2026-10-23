export interface IResumeConfig {
  content: string
  style: string
  link: string
  name: string
  type?: number
}

const UPSTASH_BASE_URL = import.meta.env.VITE_UPSTASH_BASE_URL as string

// 配了 VITE_EXPORT_URL 走外部导出服务器（兼容原作者方案）；否则走容器内置的 /api/pdf/export（Playwright）
const EXPORT_URL = (import.meta.env.VITE_EXPORT_URL as string) || '/api/pdf/export'

export async function resumeExport(data: IResumeConfig) {
  const selfHosted = !import.meta.env.VITE_EXPORT_URL
  const headers: Record<string, string> = {}
  if (selfHosted) {
    headers['Content-Type'] = 'application/json'
    const token = (import.meta.env.VITE_RESUME_TOKEN as string) || ''
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(EXPORT_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    ...(Object.keys(headers).length ? { headers } : {})
  })
  if (!res.ok) {
    // 把服务端 error 消息抛给调用方（hook.ts catch 后 errorMessage 展示）
    let message = `HTTP ${res.status}`
    try {
      const parsed = await res.json()
      if (parsed && parsed.error) message = parsed.error
    } catch {
      // 响应体不是 JSON 时保留状态码
    }
    throw new Error(message)
  }
  return await res.json()
}

export function getExportCount() {
  return new Promise((resolve, reject) => {
    fetch(`${UPSTASH_BASE_URL}/get/count`, {
      headers: {
        Authorization: import.meta.env.VITE_UPSTASH_GET_TOKEN as string
      }
    })
      .then(response => response.json())
      .then(data => resolve(data.result))
      .catch(reject)
  })
}

export async function setExportCount() {
  let count: string
  try {
    count = (await getExportCount()) as string
  } catch {
    return Promise.resolve('获取失败...')
  }
  return new Promise(resolve => {
    fetch(`${UPSTASH_BASE_URL}/set/count/${parseInt(count) + 1}`, {
      headers: {
        Authorization: import.meta.env.VITE_UPSTASH_SET_TOKEN as string
      }
    })
      .then(response => response.json())
      .then(data => resolve(data.result))
      .catch(resolve)
  })
}

export async function getTemplateCondition() {
  const res = await fetch(`${UPSTASH_BASE_URL}/get/templateData`, {
    headers: {
      Authorization: import.meta.env.VITE_UPSTASH_GET_TOKEN as string
    }
  })
  return await res.json()
}

export async function setTemplateCondition(params: { name: string }) {
  let data,
    templateData: { [key: string]: string } = {}
  try {
    data = await getTemplateCondition()
  } catch {
    return Promise.resolve({ msg: '获取模板数据失败...', result: null })
  }
  if (data.result) {
    templateData = JSON.parse(data.result)
  }
  templateData[`t${params.name}`] = String(+(templateData[`t${params.name}`] || 0) + 1)
  const res = await fetch(`${UPSTASH_BASE_URL}/set/templateData`, {
    method: 'POST',
    body: JSON.stringify(templateData),
    headers: {
      Authorization: import.meta.env.VITE_UPSTASH_SET_TOKEN as string
    }
  })
  return await res.json()
}
// 获取 Gitee 仓库 star 数量
export function queryGiteeRepoStars() {
  return new Promise(resolve => {
    fetch(import.meta.env.VITE_GITEE_API_URL as string)
      .then(res => res.json())
      .then(data => {
        // 获取仓库 star 数量
        resolve(data)
      })
      .catch(() => resolve([]))
  })
}
