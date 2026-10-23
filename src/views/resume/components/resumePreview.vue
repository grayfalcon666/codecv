<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { convertDOM } from '@/utils/moduleCombine'
import { getResume } from '@/api/modules/resumeStorage'
import { getFontFamily, getPrimaryBGColor, getPrimaryColor } from '@/templates/config'

const props = defineProps<{ name: string; type: string; mtime: number }>()
const host = ref<HTMLElement>()

// 模板样式原文（style.scss 是反编译出的纯 CSS 可直接内联 用 shadow DOM 隔离避免多个模板样式互相污染）
const styleTexts = import.meta.glob('../../../templates/modules/*/style.scss', {
  as: 'raw',
  eager: true
}) as Record<string, string>

function findTemplateCSS(type: string) {
  for (const key of Object.keys(styleTexts)) {
    const matched = key.match(/modules\/([^/]+)\/style\.scss$/)
    if (matched && matched[1] === type) return styleTexts[key]
  }
  return ''
}

// 内容缓存（按 文件名+修改时间 缓存 保存后 mtime 变化自动失效）
const contentCache = new Map<string, string>()
const pendingCache = new Map<string, Promise<string | undefined>>()
function getContent(name: string, mtime: number) {
  const cacheKey = `${name}:${mtime}`
  const cached = contentCache.get(cacheKey)
  if (cached !== undefined) return Promise.resolve(cached)
  if (!pendingCache.has(cacheKey)) {
    pendingCache.set(
      cacheKey,
      getResume(name)
        .then(res => {
          contentCache.set(cacheKey, res.content)
          if (contentCache.size > 100) contentCache.clear()
          return res.content
        })
        .catch(() => undefined)
    )
  }
  return pendingCache.get(cacheKey) as Promise<string | undefined>
}

// A4 简历按 185px 卡片宽等比缩小 只展示第一页
const A4_WIDTH = 794
const A4_HEIGHT = 1123
const SCALE = 185 / A4_WIDTH

async function render() {
  const root = host.value
  if (!root) return
  const content = await getContent(props.name, props.mtime)
  if (!host.value || !content) return
  const shadow = root.shadowRoot || root.attachShadow({ mode: 'open' })
  shadow.innerHTML = ''
  const style = document.createElement('style')
  const font = getFontFamily(props.type) || 'Noto Sans SC'
  style.textContent =
    (findTemplateCSS(props.type) || '').replace(/:root/g, ':host') +
    `:host{--markdown-primary-color:${getPrimaryColor(
      props.type
    )};--markdown-primary-bg-color:${getPrimaryBGColor(props.type)};}` +
    `.jufe *{font-family:${font},'Noto Sans SC','Noto Serif SC','Nunito',sans-serif,serif;}` +
    `.preview-page{width:${A4_WIDTH}px;height:${A4_HEIGHT}px;overflow:hidden;transform:scale(${SCALE});transform-origin:0 0;}`
  shadow.appendChild(style)
  const page = document.createElement('div')
  page.className = 'preview-page'
  const renderDom = document.createElement('div')
  renderDom.className = 'markdown-transform-html jufe'
  renderDom.innerHTML = convertDOM(content).innerHTML
  page.appendChild(renderDom)
  shadow.appendChild(page)
}

onMounted(render)
watch(() => [props.name, props.mtime], render)
</script>

<template>
  <div ref="host" class="resume-preview"></div>
</template>

<style lang="scss" scoped>
.resume-preview {
  width: 185px;
  height: 262px;
  overflow: hidden;
  background: #fff;
}
</style>
