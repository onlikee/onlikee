import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { loader } from '@guolao/vue-monaco-editor'

//引入全局样式
import './css/style.css'
import './css/themes/typography.css'
import './css/themes/light.css'
import './css/themes/dark.css'

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
