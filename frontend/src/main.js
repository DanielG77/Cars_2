import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa el router

const app = createApp(App)

app.use(router) // 👈 Esta línea es la que falta

app.mount('#app')