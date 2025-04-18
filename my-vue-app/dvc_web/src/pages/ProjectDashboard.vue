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



      <v-dialog v-model="showCreateMarkupModal" max-width="600">
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ editingMarkup ? 'Редактировать версию' : 'Создать новую версию' }}</span>
      <v-btn icon @click="closeCreateMarkupModal">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-form ref="createMarkupForm" @submit.prevent="createOrUpdateMarkup">
        <v-text-field
          v-model="newMarkup.name"
          label="Название версии"
          required
          :rules="[v => !!v || 'Обязательное поле']"
        ></v-text-field>

        <v-textarea
          v-model="newMarkup.description"
          label="Описание версии"
          required
          :rules="[v => !!v || 'Обязательное поле']"
        ></v-textarea>

        <v-btn type="submit" class="action-btn" block>
          {{ editingMarkup ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>

        <v-dialog v-model="showMarkupModal" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Версии разметок</span>
        <v-btn icon @click="closeMarkupModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn class="action-btn" @click="openCreateMarkupModal">Создать версию</v-btn>
      </v-card-title>

      <v-card-text>
        <div v-for="version in currentMarkups" :key="version.id" class="markup-item">
          <h4>{{ version.name }}</h4>
          <p>{{ version.description }}</p>
          <div class="markup-actions">
            <v-btn class="action-btn" @click="goToMarkup(version)">Перейти</v-btn>
            <v-btn class="action-btn" @click="editMarkup(version)">Редактировать</v-btn>
            <v-btn class="action-btn" @click="deleteMarkup(version.id)">Удалить</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

      <!-- Модальное окно -->
      <v-dialog v-model="showCreateModal" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ editingProject ? 'Редактировать проект' : 'Создать новый проект' }}</span>
            <v-btn icon @click="closeCreateProjectModal">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="createForm" @submit.prevent="createOrUpdateProject">
              <v-text-field
                v-model="newProject.name"
                label="Название проекта"
                required
                :rules="[v => !!v || 'Обязательное поле']"
              ></v-text-field>

              <v-textarea
                v-model="newProject.description"
                label="Описание проекта"
                required
                :rules="[v => !!v || 'Обязательное поле']"
              ></v-textarea>

              <v-btn type="submit" class="action-btn" block>
                {{ editingProject ? 'Сохранить' : 'Создать' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';

const createMarkupForm = ref(null);
const editingMarkup = ref(null);

// Открытие модального окна
const openCreateMarkupModal = () => {
  newMarkup.value = { name: '', description: '' }; // Очищаем форму
  showCreateMarkupModal.value = true;
};

const closeCreateMarkupModal = () => {
  showCreateMarkupModal.value = false;
  newMarkup.value = { name: '', description: '' };
  editingMarkup.value = null;
  createMarkupForm.value?.resetValidation();
};

const createOrUpdateMarkup = async () => {
  const { valid } = await createMarkupForm.value.validate();

  if (valid) {
    const projectId = currentProjectId.value;
    const project = markups.value.find(m => m.projectId === projectId);

    if (editingMarkup.value) {
      // Редактирование
      const index = project.versions.findIndex(v => v.id === editingMarkup.value.id);
      project.versions[index] = { ...newMarkup.value };
      editingMarkup.value = null; // Сброс
    } else {
      // Создание
      const newId = project ? project.versions.length + 1 : 1;
      const newVersion = {
        id: newId,
        name: newMarkup.value.name,
        description: newMarkup.value.description,
      };
      
      if (project) {
        project.versions.push(newVersion);
      } else {
        markups.value.push({ projectId, versions: [newVersion] });
      }
    }

    closeCreateMarkupModal();
  }
};

const currentProjectId = ref(null);

const projects = ref([
  {
    id: 1,
    name: 'Проект 1',
    createdAt: '2023-05-15T10:00:00Z',
    description: 'Длинное описание проекта 1.',
  },
  {
    id: 2,
    name: 'Проект 2',
    createdAt: '2023-06-20T14:30:00Z',
    description: 'Длинное описание проекта 2.',
  },
]);

const markups = ref([
  {
    projectId: 1,
    versions: [
      { id: 1, name: 'Версия 1', description: 'Описание первой версии' },
      { id: 2, name: 'Версия 2', description: 'Описание второй версии' },
    ],
  },
  {
    projectId: 2,
    versions: [
      { id: 3, name: 'Версия 1', description: 'Описание первой версии' },
    ],
  },
]);

const showCreateModal = ref(false);
const createForm = ref(null);
const editingProject = ref(null);

const showMarkupModal = ref(false);
const currentMarkups = ref([]);

// Новый проект
const newProject = ref({
  name: '',
  description: '',
});

// Открытие модального окна для создания проекта
const openCreateProjectModal = () => {
  editingProject.value = null; // Сбрасываем состояние редактирования
  newProject.value = { name: '', description: '' }; // Очищаем форму
  showCreateModal.value = true;
};

const showCreateMarkupModal = ref(false);
const newMarkup = ref({
  name: '',
  description: '',
});

// Открытие модального окна для редактирования проекта
const editProject = (id) => {
  const project = projects.value.find((p) => p.id === id);
  if (project) {
    editingProject.value = { ...project }; // Копируем данные проекта
    newProject.value = { ...project }; // Заполняем форму данными проекта
    showCreateModal.value = true;
  }
};

// Закрытие модального окна
const closeCreateProjectModal = () => {
  showCreateModal.value = false;
  newProject.value = { name: '', description: '' };
  editingProject.value = null;
  createForm.value?.resetValidation();
};

// Форматирование даты для отображения
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Создание или обновление проекта
const createOrUpdateProject = async () => {
  const { valid } = await createForm.value.validate();

  if (valid) {
    if (editingProject.value) {
      // Обновление существующего проекта
      const index = projects.value.findIndex((p) => p.id === editingProject.value.id);
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...newProject.value };
      }
    } else {
      // Создание нового проекта
      const newId = projects.value.length + 1;
      projects.value.push({
        id: newId,
        name: newProject.value.name,
        description: newProject.value.description,
        createdAt: new Date().toISOString(),
      });
    }

    closeCreateProjectModal();
  }
};

// Удаление проекта
const deleteProject = (id) => {
  projects.value = projects.value.filter((p) => p.id !== id);
};

// Навигация к просмотру проекта (заглушка)
const viewProject = (id) => {
  currentProjectId.value = id;
  const projectMarkups = markups.value.find((m) => m.projectId === id)?.versions || [];
  currentMarkups.value = projectMarkups;
  showMarkupModal.value = true;
};

// Автоматическое заполнение формы при редактировании
watch(editingProject, (newVal) => {
  if (newVal) {
    newProject.value = { ...newVal }; // Заполняем форму данными редактируемого проекта
  }
});

// Перейти к версии (заглушка)
const goToMarkup = (version) => {
  console.log('Перейти к версии:', version);
};

const editMarkup = (version) => {
  editingMarkup.value = { ...version }; // Сохраняем копию версии
  newMarkup.value = { ...version }; // Заполняем форму
  showCreateMarkupModal.value = true; // Открываем форму
};

// Удалить версию
const deleteMarkup = (id) => {
  const projectIndex = markups.value.findIndex((m) =>
    m.versions.some((v) => v.id === id)
  );
  if (projectIndex !== -1) {
    markups.value[projectIndex].versions = markups.value[
      projectIndex
    ].versions.filter((v) => v.id !== id);
    currentMarkups.value = markups.value[projectIndex].versions;
  }
};

// Закрыть модальное окно
const closeMarkupModal = () => {
  showMarkupModal.value = false;
  currentMarkups.value = [];
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
  overflow-y: auto;
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

.action-btn:hover {
  background-color: #336b87;
}

.v-card-title {
  background-color: #223748;
  color: white !important;
  padding: 16px 24px;
}


</style>