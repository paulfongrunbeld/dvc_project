<template>
  <v-container class="fill-height gradient-bg d-flex align-center justify-center">
    <v-card class="pa-6 card-style" elevation="10">
      <v-card-text class="content">
        <h2 class="title">Добро пожаловать!</h2>
        <p class="subtitle">
          Нажмите кнопку ниже, чтобы начать работу.
        </p>
        <v-btn class="start-btn" @click="startWork">Начать</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const startWork = () => {
  router.push({ name: 'ProjectDashboard' })
}
</script>

<style scoped>
/* Градиентный фон с глубиной */
.gradient-bg {
  background: radial-gradient(circle at top, #1b2838, #0f1a27 80%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Карточка */
.card-style {
  border-radius: 16px;
  background: #223748;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
  text-align: center;
  padding: 24px;
}

/* Контейнер */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Заголовок */
.title {
  font-size: 26px;
  font-weight: bold;
  color: #e0e4e8;
  margin-bottom: 8px;
}

/* Подзаголовок */
.subtitle {
  font-size: 16px;
  color: #b0b6bb;
  margin-bottom: 16px;
}

/* Кнопка */
.start-btn {
  background: #3a7e9f; /* Более тёмный оттенок синего */
  color: #ffffff; /* Белый текст */
  font-weight: bold;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: 30px;
  transition: all 0.3s ease-in-out;
  width: 100%;
  max-width: 220px;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Анимация при наведении */
.start-btn:hover {
  background: #336b87; /* Ещё более тёмный оттенок синего */
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
}
</style>
