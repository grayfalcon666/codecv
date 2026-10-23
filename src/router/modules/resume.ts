import Layout from '@/layout/main.vue'

export default {
  name: 'resume',
  path: '/resume',
  component: Layout,
  children: [
    {
      path: '/resume',
      component: () => import('@/views/resume/resume.vue')
    }
  ]
}
