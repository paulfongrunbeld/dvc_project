<template>
    <div class="annotation-panel">
      <v-btn
        v-for="annotation in annotations"
        :key="annotation"
        class="annotation-btn"
        :class="{ active: annotation === currentType }"
        @click="selectAnnotation(annotation)"
      >
        {{ annotation }}
      </v-btn>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    annotations: {
      type: Array,
      required: true,
    },
    currentType: {
      type: String,
      default: null,
    },
  });
  
  const emit = defineEmits(['update:currentType']);
  
  const selectAnnotation = (annotation) => {
    emit('update:currentType', annotation);
  };
  </script>
  
  <!-- Стили вынесены в общий CSS (styles.css) -->
  <style src="../pages/styles.css"></style>
  