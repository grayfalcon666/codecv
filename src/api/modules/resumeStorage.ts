// 简历保存服务接口（自己的服务器，见仓库根目录 server.mjs）
// 单容器部署时接口同源，未配置时默认相对路径（.dockerignore 排除了 .env*，镜像内无 env 文件）
const BASE = (import.meta.env.VITE_RESUME_API_URL as string) || '/api/resume'
const TOKEN = (import.meta.env.VITE_RESUME_TOKEN as string) || ''

export interface ResumeFile {
  name: string
  size: number
  mtime: number
  type?: string
}

function headers(hasBody = false) {
  const result: Record<string, string> = {}
  if (hasBody) result['Content-Type'] = 'application/json'
  if (TOKEN) result.Authorization = `Bearer ${TOKEN}`
  return result
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data && data.error) message = data.error
    } catch {
      // 响应体不是 JSON 时保留状态码信息
    }
    throw new Error(message)
  }
  return res.json()
}

export function listResumes(): Promise<ResumeFile[]> {
  return request(`${BASE}/list`, { headers: headers() })
}

export function saveResume(
  name: string,
  content: string,
  type: string
): Promise<{ ok: boolean; name: string }> {
  return request(`${BASE}/save`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ name, content, type })
  })
}

export function getResume(name: string): Promise<{ name: string; content: string; type?: string }> {
  return request(`${BASE}/get?name=${encodeURIComponent(name)}`, { headers: headers() })
}

export function deleteResume(name: string): Promise<{ ok: boolean }> {
  return request(`${BASE}/delete?name=${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: headers()
  })
}
