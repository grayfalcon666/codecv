<script setup lang="ts">
import { setExportCount, setTemplateCondition } from '@/api/modules/resume'
import { nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useEditorStore from '@/store/modules/editor'
import { getFontFamily, getPrimaryBGColor, getPrimaryColor } from '@/templates/config'
import {
  CUSTOM_MARKDOWN_PRIMARY_BG_COLOR,
  CUSTOM_MARKDOWN_PRIMARY_COLOR,
  MARKDOWN_FONT
} from '@/views/editor/components/tabbar/hook'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()

// 模板样式原文（?inline 拿编译后的 CSS 字符串 dev/prod 都可用 不依赖 importCSS 的注入时机）
const cssModules = import.meta.glob('../../templates/modules/*/style.scss', {
  query: '?inline',
  import: 'default',
  eager: false
}) as Record<string, () => Promise<string>>

onMounted(async () => {
  const type = String(route.query.type || '')
  if (!type) return
  const target = document.querySelector('.markdown-transform-html') as HTMLElement
  target.innerHTML = editorStore.nativeContent
  editorStore.resetNativeContent() // 重置
  // 打印页自带模板样式和颜色变量 不依赖编辑器页面遗留的样式
  try {
    const css = await cssModules[`../../templates/modules/${type}/style.scss`]?.()
    if (css) {
      const style = document.createElement('style')
      // 编辑器里自定义过的颜色/字体优先（对应 style 标签已留在 head 中）不再注入默认值
      let vars = ''
      if (!document.head.querySelector(`style[${CUSTOM_MARKDOWN_PRIMARY_COLOR}-${type}]`)) {
        vars += `--markdown-primary-color:${getPrimaryColor(type)};`
      }
      if (!document.head.querySelector(`style[${CUSTOM_MARKDOWN_PRIMARY_BG_COLOR}-${type}]`)) {
        vars += `--markdown-primary-bg-color:${getPrimaryBGColor(type)};`
      }
      let fontRule = ''
      if (!document.head.querySelector(`style[${MARKDOWN_FONT}-${type}]`)) {
        const font = getFontFamily(type) || 'Noto Sans SC'
        fontRule = `.jufe *{font-family:${font},'Noto Sans SC','Noto Serif SC','Nunito',sans-serif,serif;}`
      }
      style.textContent = (vars ? `:root{${vars}}` : '') + fontRule + css
      document.head.appendChild(style)
    }
  } catch {
    // 样式拿不到时仍可打印 只是没有模板样式
  }
  await nextTick()
  setTimeout(() => {
    setExportCount()
    setTemplateCondition({ name: type })
    window.print()
    router.back()
  }, 200)
})

onUnmounted(() => {
  localStorage.removeItem('download')
})
</script>

<template>
  <div class="markdown-transform-html jufe"></div>
</template>

<style lang="scss" scoped>
.jufe {
  width: 210mm;
  position: relative;
  min-height: 295mm;
  z-index: 1;
  &::after {
    content: '';
    background: inherit;
    z-index: -2;
    position: fixed;
    top: 0;
    left: 0;
    width: 120vw;
    height: 120vh;
  }
}
</style>
