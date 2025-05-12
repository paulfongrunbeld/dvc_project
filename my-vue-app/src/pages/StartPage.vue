<template>
  <v-container class="fill-height d-flex align-center justify-center" fluid>
    <!-- Заголовок -->
    <h1 class="header">Система контроля версий графических данных</h1>

    <!-- Контейнер для карточек -->
    <div class="cards-container">
      <!-- Первая карточка -->
      <v-card class="pa-6 card-style" elevation="3">
        <v-card-text class="content">
          <!-- Иконка -->
          <svg-icon type="mdi" :path="mdiImageFilterNone" class="icon"></svg-icon>

          <!-- Заголовок -->
          <h2 class="title">Галлерея</h2>

          <!-- Подзаголовок -->
          <p class="subtitle">
            Загруженные изображения с их аннотированными версиями
          </p>

          <!-- Кнопка -->
          <v-btn class="start-btn" @click="startGallery">
            Перейти
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Вторая карточка -->
      <v-card class="pa-6 card-style" elevation="3">
        <v-card-text class="content">
          <!-- Иконка -->
          <svg-icon type="mdi" :path="mdiListBoxOutline" class="icon"></svg-icon>

          <!-- Заголовок -->
          <h2 class="title">Проекты</h2>

          <!-- Подзаголовок -->
          <p class="subtitle">
            Доска с проектами, содержащими версии разметок
          </p>

          <!-- Кнопка -->
          <v-btn class="start-btn" @click="startProjects">
            Перейти
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiImageFilterNone } from '@mdi/js'
import { mdiListBoxOutline } from '@mdi/js';

const router = useRouter()

const startProjects = () => {
  router.push({ name: 'ProjectDashboard' })
}
const startGallery = () => {
  router.push({ name: 'GalleryPage' }); // Переход на страницу галереи
};
</script>

<style scoped>
/* Фон */
.fill-height {
  background: linear-gradient(135deg, #f9f9f9, #eaeaea);
  min-height: 100vh;
  display: flex;
  flex-direction: column; /* Изменено на колонку */
  align-items: center;
  justify-content: center;
}

/* Заголовок */
.header {
  font-size: 28px;
  font-weight: 600;
  color: #444444; /* Темно-серый */
  margin-bottom: 44px; /* Отступ между заголовком и карточками */
  text-align: center;
  transition: transform 0.3s ease-in-out; /* Анимация увеличения */
}

/* Анимация заголовка при наведении */
.header:hover {
  transform: scale(1.05); /* Легкое увеличение */
}

/* Контейнер для карточек */
.cards-container {
  display: flex;
  gap: 24px; /* Промежуток между карточками */
  justify-content: center; /* Выравнивание по центру */
  width: 100%;
  max-width: 900px; /* Ограничение ширины контейнера */
}

/* Карточка */
.card-style {
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 400px; /* Максимальная ширина каждой карточки */
  text-align: center;
  padding: 32px;
}

/* Контейнер */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Иконка */
.icon {
  width: 48px;
  height: 48px;
  color: #cccccc; /* Светло-серый */
}

/* Заголовок внутри карточки */
.title {
  font-size: 24px;
  font-weight: 600;
  color: #444444; /* Темно-серый */
  margin-bottom: 10px;
}

/* Подзаголовок */
.subtitle {
  font-size: 14px;
  color: #888888; /* Средне-серый */
  margin-bottom: 16px;
}

/* Кнопка */
.start-btn {
  background: #444444; /* Темно-серый */
  color: #ffffff; /* Белый текст */
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center; /* Выравнивание текста по центру */
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Анимация при наведении */
.start-btn:hover {
  background: #333333; /* Чуть темнее серый */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>