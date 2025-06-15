<template>
  <v-container class="gallery-page">
    <!-- Заголовок -->
    <h1 class="page-title">Галерея</h1>

    <!-- Сетка изображений -->
    <div class="gallery-grid">
      <div v-for="(image, index) in images" :key="index" class="gallery-item" @click="openVersionsModal(image)">
        <img :src="`data:image/jpeg;base64,${getbase64(image)}`" alt="Изображение" class="gallery-image" />
        <p class="image-caption">Изображение {{ image.uuid }}</p>
      </div>
    </div>

    <!-- Пагинация -->
    <div class="pagination">
      <v-btn :disabled="currentPage === 1" @click="prevPage()">Предыдущая</v-btn>
      <span>Страница {{ currentPage }} из {{ totalPages }}</span>
      <v-btn :disabled="currentPage === totalPages" @click="nextPage()">Следующая</v-btn>
    </div>
  </v-container>

  <!-- Модальное окно для версий -->
  <v-dialog v-model="isVersionsModalOpen" max-width="800">
    <v-card>
      <v-card-title class="v-card-title">Версии разметки</v-card-title>
      <v-btn class="close-btn" @click="closeVersionsModal">Закрыть</v-btn>

      <!-- Контейнер для изображения и разметки -->
      <div class="version-content">
        <!-- Canvas для отрисовки изображения и разметки -->
        <div class="learning-image-section">
          <canvas ref="canvas" class="zoomed-canvas" />
        </div>

        <!-- Список версий -->
        <div class="versions-list">
          <h4>Список версий:</h4>
          <div v-for="(markup, index) in markups" :key="index" class="version-item" @click="selectMarkup(markup)">
            <div class="version-caption">Версия {{ markup.uuid }}</div>
            <img v-if="markup.learningImage" :src="markup.learningImage" alt="Preview" class="version-image" />
          </div>
        </div>

        <!-- Поля разметки -->
        <div v-if="selectedMarkup" class="markup-details">
          <h4>Поля разметки:</h4>
          <pre>{{ parsedMarkup }}</pre>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const api = proxy.$api;
const cookies = {};
const isVersionsModalOpen = ref(false);
const selectedImage = ref(null);
const markups = ref([]);
const selectedMarkup = ref(null);
const images = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 10;
const canvas = ref(null);

// Получение Base64 изображения
function getbase64(image) {
  return image.base64;
}

// Открытие модального окна и загрузка разметок
const openVersionsModal = async (image) => {
  selectedImage.value = image;
  try {
    const response = await api.image.getMarkups(image.uuid);
    markups.value = response.map(markup => ({
      ...markup,
      learningImage: markup.learningBase64 || null
    }));
    isVersionsModalOpen.value = true;
    // Задержка для отрисовки после открытия модального окна
    setTimeout(() => drawMarkup(), 100);
  } catch (error) {
    console.error('Ошибка загрузки разметок:', error);
    alert('Не удалось загрузить разметки');
  }
};

// Закрытие модального окна
const closeVersionsModal = () => {
  isVersionsModalOpen.value = false;
  selectedImage.value = null;
  markups.value = [];
  selectedMarkup.value = null;
  // Очистка canvas
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }
};

// Выбор разметки и отрисовка на canvas
const selectMarkup = (markup) => {
  selectedMarkup.value = markup;
  drawMarkup();
};

// Парсинг JSON-разметки
const parsedMarkup = computed(() => {
  try {
    if (!selectedMarkup.value || !selectedMarkup.value.jsonData) {
      console.warn('jsonData отсутствует');
      return {};
    }

    const parsed = JSON.parse(selectedMarkup.value.jsonData);

    // Если это массив (как в вашем случае), оборачиваем его в объект
    if (Array.isArray(parsed)) {
      return { annotations: parsed };
    }

    // Если это объект, но без поля annotations — тоже оборачиваем
    if (typeof parsed === 'object' && parsed !== null && !parsed.annotations) {
      return { annotations: [parsed] };
    }

    return parsed;
  } catch (e) {
    console.error('Ошибка парсинга JSON:', e);
    return {};
  }
});

// Отрисовка изображения и разметки на canvas
const drawMarkup = () => {
  if (!canvas.value || !selectedImage.value) return;

  const ctx = canvas.value.getContext('2d');
  const image = new Image();
  const imgSrc = selectedMarkup.value?.learningImage || selectedImage.value.base64;

  const canvasWidth = 600;
  const canvasHeight = 400;
  canvas.value.width = canvasWidth;
  canvas.value.height = canvasHeight;

  // Логируем начальные данные
  console.log('parsedMarkup:', parsedMarkup.value);

  image.onload = () => {
    console.log("onload")
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    // Рассчитываем масштаб и позицию для сохранения пропорций
    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;

    // Очистка canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем изображение с сохранением пропорций
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    console.log("draw")
    // Проверяем, есть ли аннотации
    console.log(selectedMarkup.value)
    console.log(parsedMarkup.value.annotations)
    if (selectedMarkup.value && parsedMarkup.value.annotations) {
      console.log("check")
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);

      parsedMarkup.value.annotations.forEach(annotation => {
        const x = annotation.x1 * scale + offsetX;
        const y = annotation.y1 * scale + offsetY;
        const width = (annotation.x2 - annotation.x1) * scale;
        const height = (annotation.y2 - annotation.y1) * scale;

        // Рисуем прямоугольник
        ctx.strokeRect(x, y, width, height);

        // Подпись
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(annotation.annotation, x + 5, y + 15);
      });

      ctx.setLineDash([]);
    }
  };

  image.src = imgSrc;
};

// Загрузка изображений
const fetchImages = async (page) => {
  try {
    const response = await api.image.fetchImages(page, pageSize);
    images.value = response.items || [];
    totalPages.value = Math.ceil(response.totalCount / pageSize);
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

// Отслеживание изменения размеров canvas
watch(() => isVersionsModalOpen.value, (isOpen) => {
  if (isOpen) {
    setTimeout(() => drawMarkup(), 100);
  }
});
</script>

<style scoped>
/* Стили для canvas */
.zoomed-canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Остальные стили остаются без изменений */
.gallery-page {
  background: linear-gradient(135deg, #f9f9f9, #eaeaea);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 2.5rem;
  color: #444444;
  margin-bottom: 40px;
  text-align: center;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  box-sizing: border-box;
}

.gallery-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.gallery-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-caption {
  font-size: 1rem;
  color: #444444;
  margin-top: 10px;
  text-align: center;
}

.version-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.learning-image-section {
  flex: 2;
  min-width: 300px;
}

.versions-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.version-image {
  width: 100px;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
}

.version-caption {
  font-size: 1rem;
  color: #444444;
  flex-grow: 1;
}

.delete-btn {
  background-color: #444444;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}

.delete-btn:hover {
  background-color: #333333;
}

.v-card-title {
  background-color: #ffffff;
  color: #444444;
  padding: 16px 24px;
  font-size: 1.5rem;
  font-weight: bold;
}

.close-btn {
  background-color: transparent !important;
  color: #444444;
  font-size: 1rem;
  font-weight: bold;
  text-transform: none;
  padding: 10px;
}

.close-btn:hover {
  color: #333333;
}

.markup-details {
  margin-top: 20px;
}
</style>