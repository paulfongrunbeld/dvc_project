<!-- src/pages/MarkupPage.vue -->
<template>
    <v-container
      fluid
      class="fill-height gradient-bg d-flex align-center justify-center"
    >
      <v-card class="pa-5 card-style main-block" elevation="10">
        <v-card-text class="markup-content">
          <!-- Левая панель: загрузка изображения и канвас -->
          <div class="canvas-panel">
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
            <canvas
              ref="canvas"
              class="image-canvas"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseLeave"
            ></canvas>
          </div>
          <!-- Правая панель: кнопки аннотаций -->
          <div class="annotation-panel">
            <v-btn
              class="annotation-btn"
              :class="{ active: currentAnnotationType === 'Title' }"
              style="background-color: #ff80ab"
              @click="setAnnotationType('Title')"
            >
              Title
            </v-btn>
            <v-btn
              class="annotation-btn"
              :class="{ active: currentAnnotationType === 'Description' }"
              style="background-color: #81c784"
              @click="setAnnotationType('Description')"
            >
              Description
            </v-btn>
            <v-btn
              class="annotation-btn"
              :class="{ active: currentAnnotationType === 'Name' }"
              style="background-color: #64b5f6"
              @click="setAnnotationType('Name')"
            >
              Name
            </v-btn>
          </div>
          <v-btn class="send-btn" @click="handleSubmit">
            Отправить
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "MarkupPage",
    data() {
      return {
        img: null, // Загруженное изображение
        fileName: "", // Название загруженного файла
        canvasSize: 500, // Фиксированный размер canvas
        imageX: 0,
        imageY: 0,
        imageWidth: 0,
        imageHeight: 0,
        annotations: [], // Сохранённые аннотации
        currentAnnotation: null, // Рисуемая аннотация
        currentAnnotationType: null, // Активный тип аннотации (Title, Description, Name)
        isDrawing: false, // Флаг процесса рисования
        annotationColors: {
          Title: "#ff80ab",
          Description: "#81c784",
          Name: "#64b5f6"
        }
      };
    },
    methods: {
      handleSubmit() {
        // Формирование выходного объекта:
        // Каждая аннотация представлена объектом с полями "annotation" и "coordinates"
        const dataToSend = {
          fileName: this.fileName,
          annotations: this.annotations.map(ann => ({
            annotation: ann.type,
            coordinates: [
              Math.round(ann.x),
              Math.round(ann.y),
              Math.round(ann.x + ann.width),
              Math.round(ann.y + ann.height)
            ]
          }))
        };
        console.log(dataToSend);
      },
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      onFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.fileName = file.name; // Сохраняем название файла
        const reader = new FileReader();
        reader.onload = (e) => {
          this.loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
      },
      loadImage(imageSrc) {
        const img = new Image();
        img.onload = () => {
          this.img = img;
          // Масштабирование изображения для вмещения в квадрат 500x500 с сохранением пропорций
          const scale = Math.min(this.canvasSize / img.width, this.canvasSize / img.height);
          this.imageWidth = img.width * scale;
          this.imageHeight = img.height * scale;
          this.imageX = (this.canvasSize - this.imageWidth) / 2;
          this.imageY = (this.canvasSize - this.imageHeight) / 2;
          // Очистить все аннотации при загрузке нового изображения
          this.annotations = [];
          this.redrawCanvas();
        };
        img.src = imageSrc;
      },
      redrawCanvas() {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
        canvas.width = this.canvasSize;
        canvas.height = this.canvasSize;
        // Заливаем фон чёрным
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        // Рисуем изображение, если оно загружено
        if (this.img) {
          ctx.drawImage(this.img, this.imageX, this.imageY, this.imageWidth, this.imageHeight);
        }
        // Рисуем сохранённые аннотации
        this.annotations.forEach((ann) => {
          this.drawAnnotation(ctx, ann);
        });
        // Если рисуем новую аннотацию, отображаем её
        if (this.isDrawing && this.currentAnnotation) {
          this.drawAnnotation(ctx, this.currentAnnotation);
        }
      },
      drawAnnotation(ctx, ann) {
        const color = this.annotationColors[ann.type] || "#fff";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = color;
        let textX = ann.x + 5;
        let textY = ann.y - 5;
        if (textY < 16) {
          textY = ann.y + 20;
        }
        ctx.fillText(ann.type, textX, textY);
      },
      setAnnotationType(type) {
        this.currentAnnotationType = type;
      },
      getMousePos(event) {
        const canvas = this.$refs.canvas;
        const rect = canvas.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      },
      handleMouseDown(event) {
        if (!this.currentAnnotationType || !this.img) return;
        
        // Удаляем предыдущую аннотацию того же типа при начале нового рисования
        this.annotations = this.annotations.filter(ann => ann.type !== this.currentAnnotationType);
        
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
      handleMouseMove(event) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(event);
        const ann = this.currentAnnotation;
        ann.width = pos.x - ann.x;
        ann.height = pos.y - ann.y;
        this.redrawCanvas();
      },
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
  /* Градиентный фон, как в StartPage.vue */
  .gradient-bg {
    background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Основной блок (карточка) с отступами сверху и снизу */
  .main-block {
    margin: 0px 0;
    width: 100%;
    max-width: 600px;
    text-align: center;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
  
  /* Контейнер внутреннего контента карточки */
  .markup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
  }
  
  /* Панель с канвасом (слева) */
  .canvas-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  /* Панель с кнопками аннотаций (справа) */
  .annotation-panel {
    display: flex;
    flex-direction: row;
    gap: 12px;
    width: 90%;
    justify-content: space-between;
  }
  
  /* Кнопки аннотаций */
  .annotation-btn {
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    padding: 12px;
    border-radius: 12px;
    transition: transform 0.3s ease;
    width: 33.33%;
    box-sizing: border-box;
  }
  .annotation-btn:hover {
    transform: scale(1.05);
  }
  .annotation-btn.active {
    box-shadow: 0 0 15px #000000a5;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  
  /* Кнопка загрузки */
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
  }
  
  /* Кнопка отправки */
  .send-btn {
    background-color: #ff6b6b;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 12px;
    transition: all 0.3s ease-in-out;
    width: 100%;
    max-width: 300px;
    box-sizing: border-box;
    margin-top: 5px;
  }
  .send-btn:hover {
    background-color: #ff4757;
    transform: scale(1.05);
  }
  </style>
  