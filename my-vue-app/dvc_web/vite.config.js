import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'node:url'; // Для работы с путями
import { VitePWA } from 'vite-plugin-pwa'; // Опционально: PWA
import { visualizer } from 'rollup-plugin-visualizer'; // Опционально: анализ сборки

export default defineConfig({
  // Базовый путь для деплоя (если проект лежит в подпапке)
  base: '/',

  // Плагины
  plugins: [
    vue(), // Поддержка Vue
    vuetify({ autoImport: true }), // Автоимпорт компонентов Vuetify
    VitePWA({ // Опционально: PWA
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Vue App',
        short_name: 'VueApp',
        description: 'A Vue.js application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    visualizer({ // Опционально: визуализация размера сборки
      open: true,
      filename: 'bundle-stats.html',
    }),
  ],

  // Настройки сервера для разработки
  server: {
    port: 5173, // Порт
    open: true, // Автоматически открывать браузер
    proxy: { // Прокси для API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Настройки сборки
  build: {
    outDir: 'dist', // Папка для сборки
    assetsDir: 'assets', // Папка для статики
    sourcemap: true, // Генерация sourcemaps
    minify: 'terser', // Минификация кода
    rollupOptions: {
      output: {
        manualChunks: { // Разделение кода на чанки
          vue: ['vue', 'vue-router', 'pinia'],
          vendor: ['lodash', 'axios'],
        },
      },
    },
  },

  // Алиасы для путей
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // Алиас для src
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)), // Алиас для компонентов
    },
  },

  // Оптимизация
  optimizeDeps: {
    include: ['vue', 'vue-router'], // Предварительная сборка зависимостей
  },

  // Переменные окружения
  define: {
    'process.env': process.env, // Передача переменных окружения
  },

  // CSS
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // Глобальные стили
      },
    },
  },
});