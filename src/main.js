import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import router from './router'

import {
  startCloudSync
} from './services/cloudSync'

import './assets/styles/base.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

// Antes de mostrar la aplicación,
// obtenemos la información compartida
// que está guardada en Netlify.
await startCloudSync(pinia)

app.use(router)

app.mount('#app')