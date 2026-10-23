<script setup lang="ts">
import NavBar from '@/components/navBar.vue'
import resumeCard from './components/resumeCard.vue'
import Empty from '@/components/empty.vue'
import { templateCategory } from './constant'
import { useCategory, useTemplateData, useNotification } from './hook'
import { numFormat } from '@/utils/format'
import ToastModal from '@/components/toast-modal/toastModal.vue'

const { queryCategory, data } = useCategory()
const { ranks } = useTemplateData()
const { flag, close } = useNotification()
</script>

<template>
  <div class="resume-container flex">
    <div class="resume-left-container content-card" data-aos="fade-right">
      <NavBar button="创作模板" :tabs="templateCategory" @tab-click="queryCategory" />
      <div class="resume-card-container" v-if="data.length">
        <resume-card v-for="theme in data" :key="theme.id" :theme="theme" />
      </div>
      <Empty v-else title="暂时没有这类模板 你可以点击右上角创作模板或联系作者添加～" />
    </div>
    <div class="resume-right-container" data-aos="fade-left">
      <div class="resume-hot-rank content-card mb-20">
        <strong class="mb-20">简历模板热度排行</strong>
        <ul v-if="ranks.length">
          <li
            v-for="(t, idx) in ranks"
            :key="t.type"
            class="flex hover pointer"
            @click="$router.push({ path: `/editor`, query: { type: t.type, fresh: 1 } })"
          >
            <el-tooltip :content="t.name" placement="left">
              <p class="line-1">
                <span class="mr-10">{{ idx + 1 }}</span
                >{{ t.name }}
              </p>
            </el-tooltip>
            <sub> <i class="iconfont icon-hot"></i> {{ numFormat(+String(t.hot)) }}</sub>
          </li>
        </ul>
        <Empty title="正在加载中" v-else />
      </div>
      <div class="resume-notification content-card">
        <strong>公告</strong>
        <p>
          如果你觉得项目对你有所帮助，请考虑为
          <a href="https://github.com/acmenlei/codecv" target="_blank">项目</a>
          点一个 <i class="iconfont icon-star"></i>，若遇到 BUG 请通过底部微信/
          <a href="https://github.com/acmenlei/codecv/issues" target="_blank">issues</a>
          描述并复现你所遇到的问题，良好的用户体验需要大家一起来构建，感谢大家的支持～🙏
        </p>
      </div>
    </div>
  </div>
  <ToastModal :flag="flag" @close="close">
    <h3 style="margin-bottom: 10px">通知</h3>
    <p style="line-height: 27px">
      近期反应同学较多，发个通知告知一下，此网址为备用网址，若需体验更多功能请前往主站<a
        target="_blank"
        href="https://codecv.top"
        style="color: var(--theme); text-decoration: none"
      >
        https://codecv.top</a
      >
    </p>
    <ol class="" style="margin: 10px 0; padding-left: 20px; line-height: 28px">
      <li>🌈 主站导出文件更稳定</li>
      <li>✍🏻 编写体验更好</li>
      <li>✨ 工具更加完善</li>
      <li>☁️ 数据云端实时保存</li>
    </ol>
    <p>若不需要请直接忽略，谢谢配合!</p>
    <br />
    <div class="flex group">
      <img src="@/assets/img/wechat_group.png" style="width: 30%" />
      <h4>加入群聊获取最新情报，兄弟萌速速来水群 ✌🏻</h4>
    </div>
    <p style="text-align: center; margin-top: 20px">
      <button class="primary btn" @click="close">知道了</button>
    </p>
  </ToastModal>
</template>

<style lang="scss" scoped>
.resume-container {
  max-width: var(--max-width);
  margin: 20px auto;

  .resume-notification {
    padding-bottom: 140px;
    position: sticky;
    top: 80px;
    font-size: 15px;
    line-height: 28px;
    strong {
      display: inline-block;
      margin-bottom: 10px;
      padding-bottom: 5px;
      color: var(--theme);
    }
    a {
      color: #5e75eb;
    }
  }

  .resume-hot-rank {
    strong {
      display: inline-block;
      color: var(--theme);
    }
    li {
      font-size: 14px;
      line-height: 30px;
      p {
        max-width: 135px;
      }
      sub {
        font-weight: 500;
        white-space: nowrap;
        color: orangered;
        text-align: right;
        flex-grow: 1;
      }
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        p span {
          color: orangered;
        }
      }
    }
  }

  .resume-left-container {
    margin-right: 20px;
    .resume-card-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
    }
  }
}
.group {
  align-items: center;
  gap: 40px;
}
@media screen and (max-width: 800px) {
  .resume-right-container {
    display: none;
  }
  .resume-left-container {
    margin-left: 20px;
  }
}
</style>
