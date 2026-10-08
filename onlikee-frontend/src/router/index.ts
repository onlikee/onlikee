import { createRouter, createWebHistory } from 'vue-router'

import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    // 如果有保存的位置（前进/后退），使用它
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部（新页面）
    return { top: 0 }
  },
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = typeof to.meta.title === 'string' ? to.meta.title : 'onlikee'
  next()
})

export default router
