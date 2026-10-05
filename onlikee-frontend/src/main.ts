import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loader } from '@guolao/vue-monaco-editor'

//引入全局样式
import './css/style.css'
// @primer/primitives@11.5.1 vendored tokens（scripts/vendor-primitives-base.mjs 生成）
import './css/themes/base-size.css'
import './css/themes/base-motion.css'
import './css/themes/typography.css'
import './css/themes/border.css'
import './css/themes/radius.css'
import './css/themes/size.css'
import './css/themes/size-fine.css'
import './css/themes/size-coarse.css'
import './css/themes/light.css'
import './css/themes/dark.css'
// Primer BaseStyles 等价全局样式（body 排版/焦点重置/链接默认），须在主题 token 之后
import './css/base-styles.css'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs'
  }
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
const userStore = useUserStore(pinia)

Promise.all([userStore.hydrateUser(), router.isReady()]).then(() => {
  app.mount('#app')
})
