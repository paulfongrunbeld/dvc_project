import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Если используется Vue Router
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Стили Vuetify
import { API } from './modules/api';


// Создаем экземпляр Vuetify
const vuetify = createVuetify();

// Создаем приложение Vue
const app = createApp(App);
const api = new API("http://127.0.0.1:2582", {})
app.config.globalProperties.$api = api;
// Подключаем плагины
app.use(router); // Если используется Vue Router
app.use(vuetify);

// Монтируем приложение
app.mount('#app');