<template>
  <v-container fluid class="fill-height gradient-bg d-flex align-center justify-center">
    <div class="main-wrapper">
      <!-- Компонент панели аннотаций -->
      <AnnotationPanel
        :annotations="annotationsList"
        v-model:currentType="currentAnnotationType"
      />
      <!-- Компонент CanvasEditor, куда передаётся текущий выбранный тип аннотации -->
      <div>
        <CanvasEditor :currentType="currentAnnotationType" ref="canvasEditor" />
        <v-btn class="send-btn" @click="submitData">Отправить</v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import AnnotationPanel from '../components/AnnotationPanel.vue';
import CanvasEditor from '../components/CanvasEditor.vue';

const annotationsList = ref(["Title", "Description", "Name"]);
const currentAnnotationType = ref(null);
const canvasEditor = ref(null);

const submitData = () => {
  canvasEditor.value.handleSubmit();
};
</script>

<style src="./styles.css"></style>
