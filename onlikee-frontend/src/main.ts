import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loader } from '@guolao/vue-monaco-editor'

//引入全局样式
import './css/style.css'
// 全局主题变量。
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
// 全局排版、焦点和链接样式，须在主题变量之后加载。
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
