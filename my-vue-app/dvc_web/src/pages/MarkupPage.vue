<!-- src/pages/MarkupPage.vue -->
<template>
    <v-container fluid class="markup-container">
      <v-row class="d-flex justify-center">
        <!-- Левая колонка: загрузка и canvas -->
        <v-col cols="12" md="8" class="left-panel">
          <v-card class="pa-5 card-style left-card" elevation="10">
            <v-card-text class="content">
              <h2 class="title">Разметка изображения</h2>
              <p class="subtitle">
                Нажмите кнопку ниже, чтобы загрузить изображение для разметки.
              </p>
              <!-- Кнопка загрузки изображения -->
              <v-btn class="start-btn" @click="triggerFileInput">
                <v-icon left></v-icon>Загрузить изображение
              </v-btn>
              <!-- Скрытый input для выбора файла -->
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="onFileChange"
              />
              <!-- Canvas для отображения изображения и аннотаций -->
              <canvas
                ref="canvas"
                class="image-canvas"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseLeave"
              ></canvas>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Правая колонка: кнопки для выбора типа разметки -->
        <v-col cols="12" md="4" class="right-panel">
          <v-card class="pa-5 card-style" elevation="10">
            <v-card-text class="annotation-buttons">
              <v-btn
                class="annotation-btn"
                :class="{ active: currentAnnotationType === 'Title' }"
                style="background-color: #ff6b6b"
                @click="setAnnotationType('Title')"
              >
                Title
              </v-btn>
              <v-btn
                class="annotation-btn"
                :class="{ active: currentAnnotationType === 'Description' }"
                style="background-color: #4caf50"
                @click="setAnnotationType('Description')"
              >
                Description
              </v-btn>
              <v-btn
                class="annotation-btn"
                :class="{ active: currentAnnotationType === 'Name' }"
                style="background-color: #2196f3"
                @click="setAnnotationType('Name')"
              >
                Name
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "MarkupPage",
    data() {
      return {
        // Загруженное изображение
        img: null,
        // Фиксированный размер canvas
        canvasSize: 500,
        imageX: 0,
        imageY: 0,
        imageWidth: 0,
        imageHeight: 0,
        // Список зафиксированных аннотаций
        annotations: [],
        // Текущая (рисуемая) аннотация
        currentAnnotation: null,
        // Активный тип разметки (выбирается кнопками справа)
        currentAnnotationType: null,
        // Флаг, указывающий на процесс рисования
        isDrawing: false,
        // Цвета для каждого типа аннотации
        annotationColors: {
          Title: "#ff6b6b",
          Description: "#4caf50",
          Name: "#2196f3"
        }
      };
    },
    methods: {
      // Открываем диалог выбора файла
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      // Обработка выбора изображения
      onFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
      },
      // Загрузка изображения и расчет параметров для отрисовки
      loadImage(imageSrc) {
        const img = new Image();
        img.onload = () => {
          this.img = img;
          // Расчет коэффициента масштабирования для вмещения в квадрат 500x500 с сохранением пропорций
          const scale = Math.min(this.canvasSize / img.width, this.canvasSize / img.height);
          this.imageWidth = img.width * scale;
          this.imageHeight = img.height * scale;
          this.imageX = (this.canvasSize - this.imageWidth) / 2;
          this.imageY = (this.canvasSize - this.imageHeight) / 2;
          this.redrawCanvas();
        };
        img.src = imageSrc;
      },
      // Перерисовка canvas: заливаем фон, отрисовываем изображение и аннотации
      redrawCanvas() {
        const canvas = this.$refs.canvas;
        // eslint-disable-next-line no-unused-vars
        const ctx = canvas.getContext("2d");
        canvas.width = this.canvasSize;
        canvas.height = this.canvasSize;
        // Заполняем фон черным
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        // Рисуем изображение, если оно загружено
        if (this.img) {
          ctx.drawImage(this.img, this.imageX, this.imageY, this.imageWidth, this.imageHeight);
        }
        // Рисуем сохраненные аннотации
        this.annotations.forEach((ann) => {
          this.drawAnnotation(ctx, ann);
        });
        // Если рисуем новую аннотацию, отображаем её
        if (this.isDrawing && this.currentAnnotation) {
          this.drawAnnotation(ctx, this.currentAnnotation);
        }
      },
      // Отрисовка отдельной аннотации: прямоугольник и подпись
      drawAnnotation(ctx, ann) {
        const color = this.annotationColors[ann.type] || "#fff";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = color;
        // Расчет координат для подписи так, чтобы она не выходила за пределы canvas
        let textX = ann.x + 5;
        let textY = ann.y - 5;
        if (textY < 16) {
          // Если слишком близко к верхней границе, выводим подпись внутри прямоугольника
          textY = ann.y + 20;
        }
        if (textX < 0) {
          textX = ann.x + 5;
        }
        ctx.fillText(ann.type, textX, textY);
      },
      // Устанавливаем активный тип аннотации по клику на кнопке справа
      setAnnotationType(type) {
        this.currentAnnotationType = type;
      },
      // Получение координат мыши относительно canvas
      getMousePos(event) {
        const canvas = this.$refs.canvas;
        const rect = canvas.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      },
      // Начало рисования аннотации (mousedown)
      handleMouseDown(event) {
        if (!this.currentAnnotationType || !this.img) return;
        this.isDrawing = true;
        const pos = this.getMousePos(event);
        this.currentAnnotation = {
          type: this.currentAnnotationType,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0
        };
      },
      // Обновление аннотации при движении мыши (mousemove)
      handleMouseMove(event) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(event);
        const ann = this.currentAnnotation;
        ann.width = pos.x - ann.x;
        ann.height = pos.y - ann.y;
        this.redrawCanvas();
      },
      // Окончание рисования (mouseup)
      handleMouseUp() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (
          this.currentAnnotation &&
          Math.abs(this.currentAnnotation.width) > 5 &&
          Math.abs(this.currentAnnotation.height) > 5
        ) {
          let { x, y, width, height } = this.currentAnnotation;
          if (width < 0) {
            x += width;
            width = Math.abs(width);
          }
          if (height < 0) {
            y += height;
            height = Math.abs(height);
          }
          this.annotations.push({
            type: this.currentAnnotation.type,
            x,
            y,
            width,
            height
          });
        }
        this.currentAnnotation = null;
        this.redrawCanvas();
      },
      // Если курсор покидает canvas во время рисования – прерываем процесс
      handleMouseLeave() {
        if (this.isDrawing) {
          this.isDrawing = false;
          this.currentAnnotation = null;
          this.redrawCanvas();
        }
      }
    },
    mounted() {
      const canvas = this.$refs.canvas;
      canvas.width = this.canvasSize;
      canvas.height = this.canvasSize;
      this.redrawCanvas();
    }
  };
  </script>
  
  <style scoped>
  /* Стиль карточек */
  .card-style {
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    text-align: center;
  }
  
  /* Если белые элементы от карточки не нужны в левой части – можно задать прозрачный фон */
  .left-card {
    background: transparent;
    box-shadow: none;
    padding: 0;
  }
  
  /* Контейнер внутри карточки */
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  /* Заголовок и описание */
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .subtitle {
    font-size: 16px;
    color: #555;
    margin-bottom: 16px;
  }
  
  /* Кнопка загрузки (аналогичная StartPage) */
  .start-btn {
    background-color: #ff6b6b;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 12px;
    transition: all 0.3s ease-in-out;
    width: 100%;
  }
  .start-btn:hover {
    background-color: #ff4757;
    transform: scale(1.05);
  }
  
  /* Canvas с фиксированными размерами */
  .image-canvas {
    border: 2px dashed #ccc;
    background-color: #000;
    width: 500px;
    height: 500px;
    margin-top: 20px;
  }
  
  /* Правая панель (кнопки для выбора типа разметки) */
  .right-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Добавляем отступ слева от канваса */
    margin-left: 20px;
  }
  
  .annotation-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Кнопки разметки */
  .annotation-btn {
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    padding: 12px;
    border-radius: 12px;
    transition: transform 0.3s ease;
    width: 100%;
  }
  .annotation-btn:hover {
    transform: scale(1.05);
  }
  .annotation-btn.active {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }
  
  /* Левая панель для выравнивания */
  .left-panel {
    margin-bottom: 20px;
  }
  </style>
  