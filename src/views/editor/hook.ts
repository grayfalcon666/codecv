import { onActivated, onDeactivated, Ref, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message-box/style/css'

import { getLocalStorage } from '@/common/localstorage'
import { errorMessage, successMessage, warningMessage } from '@/common/message'
import { download, downloadOfBuffer, importCSS, isDev, queryDOM, useLoading } from '@/utils'
import { ensureEmptyPreWhiteSpace, splitPage } from './components/tabbar/hook'
import useEditorStore from '@/store/modules/editor'
import { convertDOM } from '@/utils/moduleCombine'
import { resumeExport } from '@/api/modules/resume'
import { listResumes, saveResume as saveResumeAPI, deleteResume } from '@/api/modules/resumeStorage'
import {
  CUSTOM_CSS_STYLE,
  CUSTOM_MARKDOWN_PRIMARY_COLOR,
  CUSTOM_MARKDOWN_PRIMARY_BG_COLOR,
  MARKDOWN_FONT,
  ADJUST_RESUME_MARGIN_TOP,
  AUTO_ONE_PAGE,
  LINE_HEIGHT
} from './components/tabbar/hook'

export const get = getLocalStorage,
  styleAttrs = [
    CUSTOM_MARKDOWN_PRIMARY_COLOR,
    CUSTOM_MARKDOWN_PRIMARY_BG_COLOR,
    MARKDOWN_FONT,
    LINE_HEIGHT,
    ADJUST_RESUME_MARGIN_TOP, // priority 3 (数字越大 优先级越低)
    AUTO_ONE_PAGE, // priority 2
    CUSTOM_CSS_STYLE // priority 1
  ]

export function useRenderHTML(resumeType: Ref<string>) {
  const renderDOM = ref<HTMLElement>(document.body)
  const editorStore = useEditorStore()

  onActivated(() => {
    importCSS(resumeType.value)
    renderDOM.value.innerHTML = convertDOM(editorStore.MDContent).innerHTML
    setTimeout(() => splitPage(renderDOM.value), 100)
  })

  watch(
    () => editorStore.MDContent,
    v => {
      renderDOM.value.innerHTML = convertDOM(v).innerHTML
      useThrottleFn(() => splitPage(renderDOM.value), 50)()
    }
  )
  // 刷新页面（这里是一个比较有问题的点）
  watch(
    () => resumeType.value,
    () => {
      location.reload()
    }
  )
  return {
    renderDOM
  }
}

export function useResumeType() {
  const route = useRoute()
  //初始化也需要填上值 否则后续更新不一致会导致刷新死循环
  const resumeType = ref(route.query.type ? String(route.query.type) : '10front_end')
  onActivated(() => {
    resumeType.value = route.query.type ? String(route.query.type) : '10front_end'
    // 「使用模板」入口(fresh=1)：丢弃该模板的本地草稿 以模板原始内容开始
    // 防止之前编辑留下的草稿覆盖模板默认内容
    if (route.query.fresh) {
      localStorage.removeItem(`markdown-content-${resumeType.value}`)
      const [path, queryStr] = location.hash.split('?')
      const params = new URLSearchParams(queryStr || '')
      params.delete('fresh')
      const cleanHash = path + (params.toString() ? `?${params.toString()}` : '')
      history.replaceState(null, '', location.pathname + cleanHash)
      location.reload()
    }
  })
  return {
    resumeType
  }
}
// 导出简历｜markdown内容
export function useDownLoad(type: Ref<string>) {
  const router = useRouter(),
    editorStore = useEditorStore(),
    { showLoading, closeLoading } = useLoading()
  // 导出前处理PDF中的样式
  const exportPreHandler = async () => {
    const html = queryDOM('.jufe') as HTMLElement,
      htmlStyles = getComputedStyle(html)
    const resumeBgColor = `html,body { background: ${htmlStyles.getPropertyValue(
      'background'
    )}; font-size:${htmlStyles.getPropertyValue('font-size')}; }`
    const resetStyle = ` * { margin: 0; padding: 0; box-sizing: border-box; }`
    // 获取简历模板的样式
    let style = '',
      linkURL = 'none'
    if (isDev()) {
      // 生产环境使用动态导入 生产环境使用link的方式引入（解决生产default属性不暴露的问题）
      style = await importCSS(type.value)
    } else {
      const linkStyle = document.querySelector('link[href*="/css/style"]') as HTMLLinkElement
      linkURL = linkStyle?.href || 'none'
    }
    // 处理自定义生成的样式
    for (const attr of styleAttrs) {
      const styleContent = document.head.querySelector(`style[${attr}-${type.value}]`)?.textContent
      if (!styleContent) continue
      style += styleContent
    }
    style = resetStyle + resumeBgColor + style
    return { style, link: linkURL, content: html }
  }
  // 导出PDF & 图片
  const downloadDynamic = async (isPDF: boolean, fileName?: string) => {
    const { content: html, style, link } = await exportPreHandler()
    const content = html.cloneNode(true) as HTMLElement
    !isPDF && ensureEmptyPreWhiteSpace(content)
    showLoading('正在导出请耐心等待...')
    try {
      const pdfData = await resumeExport({
        content: content.outerHTML,
        style,
        link,
        name: type.value,
        type: isPDF ? 0 : 1
      })
      const buffer = isPDF ? pdfData.pdf.data : pdfData.picture.data
      const _fileName = (fileName || document.title) + (isPDF ? '.pdf' : '.png')
      const fileType = 'application/' + isPDF ? 'pdf' : 'png'
      downloadOfBuffer(buffer, _fileName, fileType)
      successMessage('导出成功～')
    } catch (e: any) {
      const errorMsg =
        e.message == 'Failed to fetch'
          ? '国内导出易出错 请重新尝试 有条件的打开梯子后重试或使用备用导出'
          : '导出出错 请先尝试备用导出方案'
      errorMessage(errorMsg)
    }
    closeLoading()
  }

  const downloadNative = () => {
    editorStore.setNativeContent((<HTMLElement>queryDOM('.jufe')).innerHTML)
    router.push({ path: '/download', query: { type: type.value } })
  }

  const downloadMD = () => {
    const blob = new Blob([editorStore.MDContent])
    const url = URL.createObjectURL(blob)
    download(url, document.title + '.md')
    URL.revokeObjectURL(url)
    successMessage('导出成功~')
  }
  return {
    downloadMD,
    downloadDynamic,
    downloadNative
  }
}

// 从「我的简历」打开的文件在服务器上的文件名（重命名保存后同步更新）
export const savedFileName = ref('')

// 保存简历到自己的服务器（见仓库根目录 server.mjs），连同当前模板类型一起存
export function useSaveResume(resumeType: Ref<string>) {
  const editorStore = useEditorStore()
  const route = useRoute()
  const router = useRouter()
  async function saveResume(name: string) {
    const fileName = (name || '').trim()
    if (!fileName) return warningMessage('请先在上方输入框填写简历名称')
    const content = editorStore.MDContent
    if (!content || !content.trim()) return warningMessage('简历内容为空，无需保存')
    const oldName = savedFileName.value
    const renamed = oldName && oldName !== fileName
    try {
      const list = await listResumes()
      // 正在更新的这份简历（同名保存）不提示；只有和其他简历重名才提示覆盖
      const collision = list.some(item => item.name === fileName && item.name !== oldName)
      if (collision) {
        try {
          await ElMessageBox.confirm('服务器上已存在同名简历，是否覆盖？', '提示', {
            type: 'warning'
          })
        } catch {
          return // 用户取消覆盖
        }
      }
    } catch {
      // 列表拉取失败不阻断保存，保存请求自身会再报错提示
    }
    try {
      await saveResumeAPI(fileName, content, resumeType.value)
      if (renamed) {
        // 重命名保存：删除服务器上的旧文件
        try {
          await deleteResume(oldName)
        } catch {
          // 旧文件删除失败不阻断保存结果
        }
        savedFileName.value = fileName
        document.title = fileName
        // 同步地址栏 ?file= 参数，页面刷新后仍然加载新文件名
        if (route.query.file) {
          router.replace({ query: { ...route.query, file: fileName } })
        }
      }
      successMessage(renamed ? '已保存并同步重命名～' : '已保存到服务器～')
    } catch (e: any) {
      errorMessage('保存失败：' + (e?.message || '请检查服务器保存服务是否可用'))
    }
  }
  return { saveResume }
}

export function useImportMD(resumeType: string) {
  function importMD(file: File) {
    const { writable } = useEditorStore()
    if (writable) {
      return warningMessage('请先切换到Markdown模式')
    }
    const reader = new FileReader(),
      { setMDContent } = useEditorStore()
    reader.readAsText(file, 'utf-8')
    reader.onload = function (event) {
      successMessage('导入成功~')
      setMDContent((event.target?.result as string) || '', resumeType)
    }
    reader.onerror = function () {
      errorMessage('导入失败!')
    }
  }
  return {
    importMD
  }
}

export function useAvatar(resumeType: string) {
  const matchAvatarSlot = /!\[个人头像\]\(.*\)/
  function setAvatar(path: string) {
    const { MDContent, setMDContent } = useEditorStore()
    if (!matchAvatarSlot.test(MDContent)) {
      warningMessage('上传前请确保你想上传的位置在编辑器中存在 ![个人头像](...) 此关键字')
      return
    }
    const newContent = MDContent.replace(matchAvatarSlot, `![个人头像](${path})`)
    setMDContent(newContent, resumeType)
    successMessage('头像上传成功，如果你想修改为网络图片，你可直接修改对应的链接！')
    // 可能还需要处理可编辑模式中的头像
    const writableDOM = document.querySelector('.writable-edit-mode')
    if (writableDOM) {
      const avatar: HTMLImageElement | null = writableDOM.querySelector('img[alt*=个人头像]')
      avatar && (avatar.src = path)
    }
  }
  return {
    setAvatar
  }
}

export const clickedTarget = ref<HTMLElement | null>()

export function ensureResetClickedTarget() {
  clickedTarget.value = null
}

// 备用导出按钮
export function useShowExport() {
  const showExport = ref(false)

  function setShowExport() {
    const scrollTop = document.body.getBoundingClientRect().top
    if (Math.abs(scrollTop) > 50 && window.innerWidth > 600) {
      showExport.value = true
    } else {
      showExport.value = false
    }
  }

  onActivated(() => {
    document.addEventListener('scroll', useDebounceFn(setShowExport, 400))
  })

  onDeactivated(() => {
    document.removeEventListener('scroll', setShowExport)
  })
  return {
    showExport
  }
}
