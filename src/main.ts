import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import routes from './router'

// Crear la instancia del router
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Crear la instancia de Pinia
const pinia = createPinia()

// Crear la app y usar los plugins
const app = createApp(App)
app.use(router)
app.use(pinia)

// Montar la app
app.mount('#app')