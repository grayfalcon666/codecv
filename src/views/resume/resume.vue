<script setup lang="ts">
import Empty from '@/components/empty.vue'
import { formatTime } from '@/utils/date'
import { useMyResume } from './hook'
import ResumePreview from './components/resumePreview.vue'

const { list, loading, load, openEditor, downloadResume, removeResume, formatSize } = useMyResume()
</script>

<template>
  <div class="my-resume-container">
    <div class="my-resume-card content-card" data-aos="fade-right">
      <div class="my-resume-header">
        <strong>我的简历</strong>
        <button class="primary btn" @click="load">刷新列表</button>
      </div>
      <ul v-if="list.length" class="my-resume-list">
        <li v-for="item in list" :key="item.name" class="resume-card" data-aos="zoom-in">
          <div class="preview" @click="openEditor(item)">
            <ResumePreview
              :name="item.name"
              :type="item.type || '10front_end'"
              :mtime="item.mtime"
            />
          </div>
          <p class="resume-name line-1" :title="item.name">{{ item.name }}</p>
          <sub>保存于 {{ formatTime(item.mtime) }} · {{ formatSize(item.size) }}</sub>
          <div class="resume-operate">
            <button class="primary btn" @click="downloadResume(item)">下载</button>
            <el-popconfirm
              :title="`确定删除「${item.name}」吗？删除后不可恢复`"
              @confirm="removeResume(item.name)"
            >
              <template #reference>
                <button class="remove btn">删除</button>
              </template>
            </el-popconfirm>
          </div>
        </li>
      </ul>
      <Empty
        v-else
        :title="loading ? '正在加载...' : '还没有保存的简历 去编辑器点「保存」试试吧～'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.my-resume-container {
  max-width: var(--max-width);
  margin: 20px auto;

  .my-resume-card {
    padding: 20px;

    .my-resume-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      strong {
        font-size: 18px;
        color: var(--theme);
      }
    }

    .my-resume-list {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;

      .resume-card {
        width: 185px;
        margin: 5px 20px 40px 0;
        text-align: center;
        color: var(--font-color);

        .preview {
          cursor: pointer;
          width: 185px;
          height: 262px;
          border-radius: 5px;
          border: 1px solid var(--border-color, #eee);
          overflow: hidden;
          transition: transform 0.3s;

          &:hover {
            transform: translateY(-8px);
          }
        }

        .resume-name {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        sub {
          display: block;
          margin-top: 4px;
          color: var(--font-sub-color, #999);
        }

        .resume-operate {
          margin-top: 10px;

          .btn {
            margin: 0 4px;
          }

          .remove {
            background: #f56c6c;
            color: #fff;
            border-radius: 6px;

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
}
</style>
