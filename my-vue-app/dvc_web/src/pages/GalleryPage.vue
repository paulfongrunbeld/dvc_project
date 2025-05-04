<template>
    <v-container class="gallery-page">
      <!-- Заголовок -->
      <h1 class="page-title">Галерея</h1>
  
      <!-- Список изображений -->
      <div class="gallery-grid">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="gallery-item"
          @click="openVersionsModal(image)"
        >
          <img :src="image.src" alt="Изображение" class="gallery-image" />
          <p class="image-caption">{{ image.caption }}</p>
        </div>
      </div>
  
      <!-- Модальное окно для версий -->
      <v-dialog v-model="showVersionsModal" max-width="800">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Аннотированные версии</span>
            <v-btn class="close-btn" @click="closeVersionsModal">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="currentImage">
              <h3>{{ currentImage.caption }}</h3>
              <div class="versions-list">
                <div
                  v-for="(version, index) in currentImage.versions"
                  :key="index"
                  class="version-item"
                >
                  <img
                    :src="version.src"
                    alt="Аннотированная версия"
                    class="version-image"
                    @click="openZoomModal(version.src)"
                  />
                  <p class="version-caption">{{ version.caption }}</p>
                  <v-btn class="delete-btn" @click="deleteVersion(index)">Удалить</v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
  
      <!-- Модальное окно для увеличенного просмотра -->
      <v-dialog v-model="showZoomModal" max-width="90%">
        <v-card>
          <v-card-title class="d-flex justify-end">
            <v-btn class="close-btn" @click="closeZoomModal">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <img :src="zoomedImageSrc" alt="Увеличенное изображение" class="zoomed-image" />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Пример данных для галереи
  const images = ref([
    {
      src: 'https://via.placeholder.com/300',
      caption: 'Изображение 1',
      versions: [
        { src: 'https://via.placeholder.com/300/FF5733', caption: 'Версия 1' },
        { src: 'https://via.placeholder.com/300/C70039', caption: 'Версия 2' },
      ],
    },
    {
      src: 'https://via.placeholder.com/300',
      caption: 'Изображение 2',
      versions: [
        { src: 'https://via.placeholder.com/300/FFC300', caption: 'Версия 1' },
      ],
    },
  ]);
  
  // Состояния для модального окна версий
  const showVersionsModal = ref(false);
  const currentImage = ref(null);
  
  // Состояния для модального окна увеличенного просмотра
  const showZoomModal = ref(false);
  const zoomedImageSrc = ref('');
  
  // Открытие модального окна с версиями
  const openVersionsModal = (image) => {
    currentImage.value = image;
    showVersionsModal.value = true;
  };
  
  // Закрытие модального окна версий
  const closeVersionsModal = () => {
    currentImage.value = null;
    showVersionsModal.value = false;
  };
  
  // Удаление версии
  const deleteVersion = (index) => {
    if (currentImage.value && currentImage.value.versions) {
      currentImage.value.versions.splice(index, 1);
    }
  };
  
  // Открытие модального окна увеличенного просмотра
  const openZoomModal = (src) => {
    zoomedImageSrc.value = src;
    showZoomModal.value = true;
  };
  
  // Закрытие модального окна увеличенного просмотра
  const closeZoomModal = () => {
    zoomedImageSrc.value = '';
    showZoomModal.value = false;
  };
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