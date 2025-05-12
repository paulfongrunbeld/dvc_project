import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Если используется Vue Router
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Стили Vuetify

// Создаем экземпляр Vuetify
const vuetify = createVuetify();

// Создаем приложение Vue
const app = createApp(App);

// Подключаем плагины
app.use(router); // Если используется Vue Router
app.use(vuetify);

// Монтируем приложение
app.mount('#app');