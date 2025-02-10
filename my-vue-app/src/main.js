// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// Импорт плагинов
import router from './router'
import vuetify from './plugins/vuetify'

// Если есть глобальные стили или скрипты, их можно подключить здесь
import './assets/global.css'

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
