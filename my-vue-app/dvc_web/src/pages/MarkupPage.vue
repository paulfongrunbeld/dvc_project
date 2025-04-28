<template>
  <div class="annotation-page">
    <div class="main-wrapper">
      <!-- Центральная область редактирования -->
      <div class="canvas-editor-section">
        <div class="canvas-controls">
          <v-btn class="start-btn" @click="triggerFileInput">
            <v-icon left>mdi-upload</v-icon>Загрузить изображение
          </v-btn>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none"
            @change="onFileChange"
          />
        </div>
        <canvas
          ref="canvas"
          class="image-canvas"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
        ></canvas>
        <v-btn class="send-btn" @click="submitData">Отправить</v-btn>
      </div>

      <!-- Правая панель инструментов -->
      <div class="annotation-panel">
        <h4 class="panel-title">Управление аннотациями</h4>
        <div class="annotations-list">
  <div v-for="annotation in fields" :key="annotation" class="annotation-item">
    <v-btn
      class="annotation-btn"
      :class="{ active: annotation === currentAnnotationType }"
      @click="selectAnnotation(annotation)"
    >
      {{ annotation }}
    </v-btn>
    <input
      type="color"
      v-model="annotationColors[annotation]"
      class="color-picker"
    />
  </div>
</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  projectId: String,
  versionId: String,
  fields: {
    type: Array,
    default: () => []
  }
});

// Состояния для управления аннотациями
const currentAnnotationType = ref(props.fields.length ? props.fields[0] : null);
const canvasSize = 500;

// Цвета для аннотаций
const annotationColors = ref(
  props.fields.reduce((acc, field) => {
    acc[field] = '#ffffff'; // По умолчанию белый цвет
    return acc;
  }, {})
);

// Состояния для работы с изображением и аннотациями
const fileInput = ref(null);
const canvas = ref(null);
const img = ref(null);
const fileName = ref("");
const imageX = ref(0);
const imageY = ref(0);
const imageWidth = ref(0);
const imageHeight = ref(0);
const annotations = ref([]);
const currentAnnotation = ref(null);
const isDrawing = ref(false);

// Выбор типа аннотации
const selectAnnotation = (annotation) => {
  currentAnnotationType.value = annotation;
};

// Загрузка изображения
const triggerFileInput = () => {
  fileInput.value.click();
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  fileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    loadImage(e.target.result);
  };
  reader.readAsDataURL(file);
};

const loadImage = (imageSrc) => {
  const imgElement = new Image();
  imgElement.onload = () => {
    img.value = imgElement;
    const scale = Math.min(canvasSize / imgElement.width, canvasSize / imgElement.height);
    imageWidth.value = imgElement.width * scale;
    imageHeight.value = imgElement.height * scale;

    // Устанавливаем левый верхний угол изображения в левый верхний угол канваса
    imageX.value = 0; // Левый край приклеивается к левому краю канваса
    imageY.value = 0; // Верхний край приклеивается к верхнему краю канваса

    annotations.value = [];
    redrawCanvas();
  };
  imgElement.src = imageSrc;
};

// Перерисовка холста
const redrawCanvas = () => {
  const ctx = canvas.value.getContext('2d');
  canvas.value.width = canvasSize; // Очищаем канвас
  canvas.value.height = canvasSize;

  // Заливаем фон
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Рисуем изображение
  if (img.value) {
    ctx.drawImage(img.value, imageX.value, imageY.value, imageWidth.value, imageHeight.value);
  }

  // Рисуем сохраненные аннотации
  annotations.value.forEach((ann) => {
    drawAnnotation(ctx, ann);
  });

  // Рисуем текущую аннотацию
  if (isDrawing.value && currentAnnotation.value) {
    drawAnnotation(ctx, currentAnnotation.value);
  }
};

// Рисование аннотации
const drawAnnotation = (ctx, ann) => {
  const color = annotationColors.value[ann.type]; // Получаем цвет для аннотации
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

  // Добавляем текст с названием аннотации
  ctx.font = '16px Arial';
  ctx.fillStyle = color;
  let textX = ann.x + 5;
  let textY = ann.y - 5;
  if (textY < 16) {
    textY = ann.y + 20;
  }
  ctx.fillText(ann.type, textX, textY);
};

// Обработка событий мыши
const getMousePos = (event) => {
  const rect = canvas.value.getBoundingClientRect(); // Получаем положение канваса
  return {
    x: event.clientX - rect.left, // Вычитаем смещение слева
    y: event.clientY - rect.top,  // Вычитаем смещение сверху
  };
};

const handleMouseDown = (event) => {
  if (!currentAnnotationType.value || !img.value) return;

  // Удаляем существующую аннотацию выбранного типа
  annotations.value = annotations.value.filter(
    (ann) => ann.type !== currentAnnotationType.value
  );

  isDrawing.value = true;
  const pos = getMousePos(event); // Получаем корректные координаты мыши

  // Учитываем позицию изображения на канвасе
  currentAnnotation.value = {
    type: currentAnnotationType.value,
    x: pos.x - imageX.value, // Вычитаем смещение изображения по X
    y: pos.y - imageY.value, // Вычитаем смещение изображения по Y
    width: 0,
    height: 0,
  };
};

const handleMouseMove = (event) => {
  if (!isDrawing.value) return;

  const pos = getMousePos(event); // Получаем корректные координаты мыши
  const ann = currentAnnotation.value;

  // Ограничиваем ширину и высоту границами изображения
  ann.width = Math.min(imageWidth.value - ann.x, Math.max(0, pos.x - imageX.value - ann.x));
  ann.height = Math.min(imageHeight.value - ann.y, Math.max(0, pos.y - imageY.value - ann.y));

  redrawCanvas(); // Перерисовываем холст
};

const handleMouseUp = () => {
  if (!isDrawing.value) return;

  isDrawing.value = false;

  if (
    currentAnnotation.value &&
    Math.abs(currentAnnotation.value.width) > 5 &&
    Math.abs(currentAnnotation.value.height) > 5
  ) {
    let { x, y, width, height } = currentAnnotation.value;

    // Корректируем координаты, если пользователь рисует справа налево или снизу вверх
    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }

    annotations.value.push({
      type: currentAnnotation.value.type,
      x,
      y,
      width,
      height,
    });
  }

  currentAnnotation.value = null;
  redrawCanvas();
};

const handleMouseLeave = () => {
  if (isDrawing.value) {
    isDrawing.value = false;
    currentAnnotation.value = null;
    redrawCanvas();
  }
};

// Отправка данных
const submitData = () => {
  const dataToSend = {
    fileName: fileName.value,
    annotations: annotations.value.map((ann) => ({
      annotation: ann.type,
      x1: Math.round(ann.x),
      y1: Math.round(ann.y),
      x2: Math.round(ann.x + ann.width),
      y2: Math.round(ann.y + ann.height),
    })),
  };
  console.log('Отправка данных:', dataToSend);
  // Здесь можно добавить логику отправки данных на сервер
};

// Инициализация холста
onMounted(() => {
  canvas.value.width = canvasSize;
  canvas.value.height = canvasSize;
  redrawCanvas();
});
</script>

<style scoped>
.annotation-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.main-wrapper {
  display: flex;
  gap: 10px; /* Уменьшаем расстояние между канвасом и панелью */
  max-width: 1200px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.canvas-editor-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.canvas-controls {
  width: 100%;
  display: flex;
  justify-content: center;
}

.start-btn {
  background-color: #444444;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
}

.start-btn:hover {
  background-color: #333333;
}

.image-canvas {
  position: relative; /* Обеспечивает правильное позиционирование */
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1; /* Квадратный холст */
  border: 2px solid #ccc;
  background-color: black;
  cursor: crosshair;
}

.send-btn {
  background-color: #444444;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
}

.send-btn:hover {
  background-color: #333333;
}

.annotation-panel {
  width: 250px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-title {
  font-size: 1rem;
  color: #444444;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.annotations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.annotation-btn {
  background-color: #444444; /* Темно-серый */
  color: white;
  font-weight: bold;
  padding: 10px;
  border-radius: 8px;
  text-transform: uppercase;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.annotation-btn.active {
  background-color: white; /* Белый фон */
  color: black; /* Черный текст */
}

.annotation-btn:hover {
  background-color: #333333; /* Чуть темнее серый */
}

.color-picker {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>