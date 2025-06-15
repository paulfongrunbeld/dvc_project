<template>
  <v-container class="gallery-page">
    <!-- Заголовок -->
    <h1 class="page-title">Галерея</h1>

    <!-- Сетка изображений -->
    <div class="gallery-grid">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="gallery-item"
        @click="openVersionsModal(image)"
      >
        <img
          :src="`data:image/jpeg;base64,${getbase64(image)}`"
          alt="Изображение"
          class="gallery-image"
        />
        <p class="image-caption">Изображение {{ image.uuid }}</p>
      </div>
    </div>

    <!-- Пагинация -->
    <div class="pagination">
      <v-btn :disabled="currentPage === 1" @click="prevPage()">Предыдущая</v-btn>
      <span>Страница {{ currentPage }} из {{ totalPages }}</span>
      <v-btn
        :disabled="currentPage === totalPages"
        @click="nextPage()"
      >Следующая</v-btn>
    </div>
  </v-container>
</template>
  
<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';


// Инициализация API (замените на актуальные значения)
const { proxy } = getCurrentInstance();
const api = proxy.$api;
const cookies = {}; // Если требуется аутентификация через cookies

const images = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;

function getbase64(image) {
  console.log(image)
  return image.base64
}

// Загрузка изображений через ImageAPI
const fetchImages = async (page) => {
  try {
    const response = await api.image.fetchImages(page, pageSize);
    images.value = response.items
    totalPages.value = Math.ceil(response.totalCount / response.pageSize);
  } catch (error) {
    console.error('Ошибка загрузки изображений:', error);
  }
};

// Переключение страниц
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchImages(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchImages(currentPage.value);
  }
};

// Инициализация
onMounted(() => {
  fetchImages(currentPage.value);
});
</script>
  
  <style scoped>
  /* Градиентный фон страницы */
  .gallery-page {
    background: linear-gradient(135deg, #f9f9f9, #eaeaea);
  min-height: 100vh;
  display: flex;
  flex-direction: column; /* Изменено на колонку */
  align-items: center;
  justify-content: center;
  }
  
  /* Заголовок страницы */
  .page-title {
    font-size: 2.5rem;
    color: #444444; /* Темно-серый текст */
    margin-bottom: 40px;
    text-align: center;
  }
  
  /* Сетка для изображений */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 1200px;
    padding: 0 20px; /* Добавляем небольшие отступы по бокам */
    box-sizing: border-box; /* Учитываем отступы в ширине */
  }
  
  /* Карточка изображения */
  .gallery-item {
    background-color: #ffffff; /* Белый фон */
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Светлая тень */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    transition: transform 0.3s ease-in-out;
    cursor: pointer;
  }
  
  .gallery-item:hover {
    transform: scale(1.05);
  }
  
  /* Изображение внутри карточки */
  .gallery-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  /* Подпись к изображению */
  .image-caption {
    font-size: 1rem;
    color: #444444; /* Темно-серый текст */
    margin-top: 10px;
    text-align: center;
  }
  
  /* Список версий */
  .versions-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
  
  /* Элемент списка версий */
  .version-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9; /* Светло-серый фон */
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
  
  /* Изображение версии */
  .version-image {
    width: 100px;
    height: auto;
    border-radius: 8px;
    cursor: pointer; /* Добавляем указатель для кликабельности */
  }
  
  /* Подпись к версии */
  .version-caption {
    font-size: 1rem;
    color: #444444; /* Темно-серый текст */
    flex-grow: 1;
  }
  
  /* Кнопка удаления */
  .delete-btn {
    background-color: #444444; /* Черный фон */
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.3s ease-in-out;
  }
  
  .delete-btn:hover {
    background-color: #333333; /* Чуть темнее серый */
  }
  
  /* Заголовок модального окна */
  .v-card-title {
    background-color: #ffffff; /* Белый фон */
    color: #444444; /* Темно-серый текст */
    padding: 16px 24px;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  /* Кнопка закрытия модального окна */
  .close-btn {
    background-color: transparent !important; /* Убираем фон */
    color: #444444; /* Темно-серый текст */
    font-size: 1rem;
    font-weight: bold;
    text-transform: none; /* Отключаем заглавные буквы */
    padding: 10px;
  }
  
  .close-btn:hover {
    color: #333333; /* Чуть темнее серый */
  }
  
  /* Увеличенное изображение */
  .zoomed-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  </style>