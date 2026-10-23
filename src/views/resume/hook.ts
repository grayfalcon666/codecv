import { onActivated, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteResume, getResume, listResumes, ResumeFile } from '@/api/modules/resumeStorage'
import { download } from '@/utils'
import { errorMessage, successMessage } from '@/common/message'

export function useMyResume() {
  const router = useRouter()
  const list = ref<ResumeFile[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      list.value = await listResumes()
    } catch {
      list.value = []
      errorMessage('获取简历列表失败，请检查服务器保存服务是否可用')
    } finally {
      loading.value = false
    }
  }

  onActivated(load)

  function openEditor(item: ResumeFile) {
    router.push({
      path: '/editor',
      query: { type: item.type || '10front_end', file: item.name }
    })
  }

  async function downloadResume(item: ResumeFile) {
    try {
      const { content } = await getResume(item.name)
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      download(url, item.name + '.md')
      URL.revokeObjectURL(url)
    } catch {
      errorMessage('下载失败，请稍后重试')
    }
  }

  async function removeResume(name: string) {
    try {
      await deleteResume(name)
      successMessage('删除成功')
      load()
    } catch {
      errorMessage('删除失败，请稍后重试')
    }
  }

  function formatSize(size: number) {
    if (size < 1024) return size + ' B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
    return (size / 1024 / 1024).toFixed(1) + ' MB'
  }

  return { list, loading, load, openEditor, downloadResume, removeResume, formatSize }
}
