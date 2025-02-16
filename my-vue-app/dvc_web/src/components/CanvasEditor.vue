<template>
    <div class="canvas-editor">
      <v-btn class="start-btn" @click="triggerFileInput">
        <v-icon left></v-icon>Загрузить изображение
      </v-btn>
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
  </template>
  
  <script setup>
  import { ref, onMounted, defineExpose, defineProps } from 'vue';
  
  // Принимаем текущий тип аннотации из родителя через пропс
  const props = defineProps({
    currentType: {
      type: String,
      default: null,
    },
  });
  
  const canvasSize = 500;
  
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
  const annotationColor = '#ffffff';
  
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
  
  // Загружаем изображение так, чтобы его верхний левый угол был в (0,0)
  const loadImage = (imageSrc) => {
    const imgElement = new Image();
    imgElement.onload = () => {
      img.value = imgElement;
      // Вычисляем масштаб, чтобы изображение вписывалось в канвас
      const scale = Math.min(canvasSize / imgElement.width, canvasSize / imgElement.height);
      imageWidth.value = imgElement.width * scale;
      imageHeight.value = imgElement.height * scale;
      imageX.value = 0;
      imageY.value = 0;
      annotations.value = [];
      redrawCanvas();
    };
    imgElement.src = imageSrc;
  };
  
  const redrawCanvas = () => {
    const ctx = canvas.value.getContext('2d');
    canvas.value.width = canvasSize;
    canvas.value.height = canvasSize;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    if (img.value) {
      ctx.drawImage(img.value, imageX.value, imageY.value, imageWidth.value, imageHeight.value);
    }
    annotations.value.forEach((ann) => {
      drawAnnotation(ctx, ann);
    });
    if (isDrawing.value && currentAnnotation.value) {
      drawAnnotation(ctx, currentAnnotation.value);
    }
  };
  
  const drawAnnotation = (ctx, ann) => {
    ctx.strokeStyle = annotationColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = annotationColor;
    let textX = ann.x + 5;
    let textY = ann.y - 5;
    if (textY < 16) {
      textY = ann.y + 20;
    }
    ctx.fillText(ann.type, textX, textY);
  };
  
  const getMousePos = (event) => {
    const rect = canvas.value.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
  
  // Используем props.currentType для определения типа аннотации при рисовании
  const handleMouseDown = (event) => {
    if (!props.currentType || !img.value) return;
    // Удаляем существующую аннотацию выбранного типа
    annotations.value = annotations.value.filter(
      (ann) => ann.type !== props.currentType
    );
    isDrawing.value = true;
    const pos = getMousePos(event);
    currentAnnotation.value = {
      type: props.currentType,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    };
  };
  
  const handleMouseMove = (event) => {
    if (!isDrawing.value) return;
    const pos = getMousePos(event);
    const ann = currentAnnotation.value;
    ann.width = pos.x - ann.x;
    ann.height = pos.y - ann.y;
    redrawCanvas();
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
  
  onMounted(() => {
    canvas.value.width = canvasSize;
    canvas.value.height = canvasSize;
    redrawCanvas();
  });
  
  const handleSubmit = () => {
    const dataToSend = {
      fileName: fileName.value,
      annotations: annotations.value.map((ann) => ({
        annotation: ann.type,
        x1: Math.round(ann.x),
        y1: Math.round(ann.y),
        x2: Math.round(ann.x + ann.width),
        y2: Math.round(ann.y + ann.height)
      })),
    };
    console.log(dataToSend);
  };
  
  defineExpose({
    handleSubmit
  });
  </script>
  
  <style src="../pages/styles.css"></style>
  