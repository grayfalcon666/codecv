import { onActivated, ref } from 'vue'
import { useRoute } from 'vue-router'

export function useFile(emit: any) {
  const route = useRoute()
  const fileName = ref('')
  const exportFile = (type: string) => {
    document.title = fileName.value
    emit(`download-${type}` as any, fileName.value)
  }

  const importFile = (event: any) => {
    emit('import-md', event?.target?.files[0])
  }

  const saveResume = () => {
    emit('save-resume', fileName.value)
  }

  onActivated(() => {
    if (route.query.file) {
      fileName.value = String(route.query.file)
    } else if (!fileName.value) {
      // 首次进入给个像样的默认名（页面 title 是营销文案，不适合当文件名）
      fileName.value = '我的简历'
    }
  })
  return {
    fileName,
    exportFile,
    importFile,
    saveResume
  }
}
