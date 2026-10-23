<script setup lang="ts">
import { onActivated } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/header/header.vue'
import MarkdownRender from '@/views/editor/components/preview/render.vue'
import Editor from '@/views/editor/components/editor/editorContainer.vue'
import {
  useResumeType,
  useDownLoad,
  useImportMD,
  useAvatar,
  useShowExport,
  useSaveResume,
  savedFileName
} from './hook'
import { startGuide } from './components/guide/guide'
import useEditorStore from '@/store/modules/editor'
import { getResume } from '@/api/modules/resumeStorage'
import { errorMessage } from '@/common/message'

const { resumeType } = useResumeType()
const { downloadDynamic, downloadNative, downloadMD } = useDownLoad(resumeType)
const { importMD } = useImportMD(resumeType.value)
const { setAvatar } = useAvatar(resumeType.value)
const { showExport } = useShowExport()
const { saveResume } = useSaveResume(resumeType)
const editorStore = useEditorStore()
const route = useRoute()
startGuide()

// 从「我的简历」打开：?file=简历名 → 从服务器载入内容
onActivated(async () => {
  if (!route.query.file) {
    savedFileName.value = ''
    return
  }
  savedFileName.value = String(route.query.file)
  try {
    const { content } = await getResume(String(route.query.file))
    editorStore.setMDContentOnly(content)
    document.title = String(route.query.file)
  } catch (e: any) {
    errorMessage('从服务器加载简历失败：' + (e?.message || ''))
  }
})
</script>

<template>
  <Header
    @download-dynamic="(filename: string) => downloadDynamic(true, filename)"
    @download-picture="(filename: string) => downloadDynamic(false, filename)"
    @download-native="downloadNative"
    @download-md="downloadMD"
    @import-md="importMD"
    @save-resume="saveResume"
  />
  <div id="editor">
    <Editor />
    <markdown-render class="markdown-render" @upload-avatar="setAvatar" />
    <el-tooltip content="导出PDF文件" v-if="showExport">
      <i
        data-aos="fade-in"
        data-aos-duration="800"
        data-aos-offset="50"
        class="iconfont icon-export hover pointer standby-export"
        @click="downloadDynamic(true)"
      ></i>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
#editor {
  display: flex;
  position: relative;
  .markdown-render {
    flex: 1;
    margin: 0 10px;
    border-radius: 10px;
  }
  .standby-export {
    position: absolute;
    top: 120px;
    right: 30px;
    z-index: 3;
    color: #f8f8f8;
    background: var(--theme);
    text-align: center;
    line-height: 45px;
    padding-left: 2px;
    font-size: 22px;
    width: 45px;
    height: 45px;
    border-radius: 50%;

    &:hover {
      color: var(--theme);
      background: #f8f8f8;
    }
  }
}
</style>
