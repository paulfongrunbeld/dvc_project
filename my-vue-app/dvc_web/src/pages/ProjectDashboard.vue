<template>
  <v-container class="gradient-bg" fluid>
    <div class="projects-page">
      <!-- Заголовок страницы -->
      <div class="header">
        <h1 class="page-title">Проекты</h1>
        <v-btn class="action-btn" @click="openCreateProjectModal">Создать проект</v-btn>
      </div>

      <!-- Список проектов -->
      <div class="projects-list">
        <div class="project-card" v-for="project in projects" :key="project.id">
          <div class="project-card-header">
            <h3>{{ project.name }}</h3>
            <div class="project-info">
              <p class="task-type">Тип задачи: {{ project.taskType }}</p>
              <p class="created-at">Создан: {{ formatDate(project.createdAt) }}</p>
            </div>
            <div class="project-actions">
              <v-btn class="action-btn" @click="editProject(project.id)">Редактировать</v-btn>
              <v-btn class="action-btn" @click="deleteProject(project.id)">Удалить</v-btn>
            </div>
          </div>
          <p class="project-description">Описание проекта: {{ project.description }}</p>
          <v-btn class="view-project-btn" @click="viewProject(project.id)">Просмотреть</v-btn>
        </div>
      </div>

      <v-dialog v-model="showCreateModal" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Создать новый проект</span>
            <v-btn icon @click="closeCreateProjectModal">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="createForm">
              <v-text-field v-model="newProject.name" label="Название проекта" required
                :rules="[v => !!v || 'Обязательное поле']"></v-text-field>

              <v-select v-model="newProject.taskType" :items="taskTypes" label="Тип задачи" required
                :rules="[v => !!v || 'Обязательное поле']"></v-select>

              <v-textarea v-model="newProject.description" label="Описание проекта" required
                :rules="[v => !!v || 'Обязательное поле']"></v-textarea>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="closeCreateProjectModal">Отмена</v-btn>
            <v-btn color="primary" @click="createProject">Создать</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const projects = ref([
  {
    id: 1,
    name: 'Проект 1',
    taskType: 'Исследовательский',
    createdAt: '2023-05-15T10:00:00Z',
    description: 'Длинное описание проекта 1. Этот проект связан с исследовательскими задачами, где требуется большой объем анализа и создания научных отчетов.',
  },
  {
    id: 2,
    name: 'Проект 2',
    taskType: 'Разработка',
    createdAt: '2023-06-20T14:30:00Z',
    description: 'Длинное описание проекта 2. Этот проект посвящен разработке программного обеспечения, с акцентом на новые технологии и улучшение пользовательского опыта.',
  },
  {
    id: 3,
    name: 'Проект 3',
    taskType: 'Тестирование',
    createdAt: '2023-07-25T09:45:00Z',
    description: 'Длинное описание проекта 3. В этом проекте необходимо провести тестирование различных функций системы для обеспечения высокого качества продукта.',
  },
]);

const router = useRouter();
const showCreateModal = ref(false);
const createForm = ref(null);
const taskTypes = ['Исследовательский', 'Разработка', 'Тестирование', 'Другое'];

const newProject = ref({
  name: '',
  taskType: '',
  description: '',
});

const openCreateProjectModal = () => {
  showCreateModal.value = true;
};

const closeCreateProjectModal = () => {
  showCreateModal.value = false;
  newProject.value = { name: '', taskType: '', description: '' };
  createForm.value?.resetValidation();
};

const createProject = async () => {
  const { valid } = await createForm.value.validate();

  if (valid) {
    projects.value.push({
      id: projects.value.length + 1,
      ...newProject.value,
      createdAt: new Date().toISOString(),
    });

    closeCreateProjectModal();
  }
};

// Форматирование даты для отображения
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Навигация к просмотру проекта
const viewProject = (id) => {
  router.push({ name: 'ProjectDetails', params: { id } });
};

// Функции для редактирования и удаления проекта (пока заглушки)
const editProject = (id) => {
  console.log('Редактировать проект', id);
};

const deleteProject = (id) => {
  console.log('Удалить проект', id);
};
</script>

<style scoped>
.gradient-bg {
  background: radial-gradient(circle at top, #1b2838, #0f1a27 80%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.projects-page {
  max-width: 1200px;
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 20px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  align-items: center;
  max-height: 600px;
  /* Ограничиваем высоту списка проектов */
  overflow-y: auto;
  /* Добавляем вертикальный скроллер */
}

.project-card {
  background-color: #223748;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #ffffff;
  gap: 20px;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.project-card-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
}

.task-type {
  font-size: 1rem;
  color: #f4f4f4;
}

.created-at {
  font-size: 0.9rem;
  color: #b3b3b3;
}

.project-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.project-description {
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.view-project-btn {
  background-color: #3a7e9f;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
}

.view-project-btn:hover {
  background-color: #336b87;
}

.action-btn,
.action-btn {
  background-color: #3a7e9f;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.action-btn:hover,
.action-btn:hover {
  background-color: #336b87;
}

.v-card-title {
  background-color: #223748;
  color: white !important;
  padding: 16px 24px;
}

.v-card-actions {
  padding: 16px 24px;
  background-color: #f5f5f5;
}
</style>