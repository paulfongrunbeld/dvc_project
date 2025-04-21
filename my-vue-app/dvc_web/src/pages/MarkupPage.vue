<template>
  <v-container fluid class="fill-height gradient-bg d-flex align-center justify-center">
    <div class="main-wrapper">
      <AnnotationPanel
        :annotations="fields"
        v-model:currentType="currentAnnotationType"
      />
      <div>
        <CanvasEditor 
          :currentType="currentAnnotationType" 
          :availableTypes="fields"
          ref="canvasEditor" 
        />
        <v-btn class="send-btn" @click="submitData">Отправить</v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import AnnotationPanel from '../components/AnnotationPanel.vue';
import CanvasEditor from '../components/CanvasEditor.vue';

const props = defineProps({
  projectId: String,
  versionId: String,
  fields: {
    type: Array,
    default: () => []
  }
});

const currentAnnotationType = ref(props.fields.length ? props.fields[0] : null);
const canvasEditor = ref(null);

const submitData = () => {
  const data = {
    projectId: props.projectId,
    versionId: props.versionId,
    annotations: canvasEditor.value.getAnnotations()
  };
  console.log('Отправка данных:', data);
  // Здесь будет логика отправки данных на сервер
};
</script>

<style scoped>
/* Ваши существующие стили */
.main-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 20px;
}

.send-btn {
  margin-top: 20px;
  background-color: #4CAF50;
  color: white;
}
</style>