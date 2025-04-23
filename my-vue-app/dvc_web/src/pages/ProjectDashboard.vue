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
  </div>
  <p class="project-description">Описание проекта: {{ project.description }}</p>
  <div class="project-actions-bottom">
    <v-btn class="view-project-btn" @click="viewProject(project.id)">Просмотреть</v-btn>
    <v-btn class="action-btn" @click="editProject(project.id)">Редактировать</v-btn>
    <v-btn class="action-btn" @click="deleteProject(project.id)">Удалить</v-btn>
  </div>
</div>
      </div>

      <!-- Модальное окно "Создать/Редактировать проект" -->
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
              <div class="d-flex justify-end">
                <v-btn type="submit" class="action-btn">
                  {{ editingProject ? 'Сохранить' : 'Создать' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Модальное окно "Версии разметок" -->
      <v-dialog v-model="showMarkupModal" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Версии разметок</span>
            <v-btn icon @click="closeMarkupModal">
              <v-icon>mdi-close</v-icon>
            </v-btn>
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
            <div class="d-flex justify-end mt-4">
              <v-btn class="action-btn" @click="openCreateMarkupModal">Создать версию</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Модальное окно "Создать/Редактировать версию" -->
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
              <div class="d-flex justify-end">
                <v-btn type="submit" class="action-btn">
                  {{ editingMarkup ? 'Сохранить' : 'Создать' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Модальное окно "Управление полями разметки" -->
      <v-dialog v-model="showMarkupFieldsModal" max-width="800">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Управление полями разметки</span>
            <v-btn icon @click="showMarkupFieldsModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div class="field-management">
              <!-- Поле для добавления новых элементов -->
              <div class="add-field-section">
                <v-text-field
                  v-model="newFieldName"
                  label="Новое поле"
                  @keyup.enter="addField"
                ></v-text-field>
                <v-btn class="action-btn" @click="addField">Добавить поле</v-btn>
              </div>
              <!-- Список существующих полей -->
              <div class="fields-list">
                <div v-for="(field, index) in currentMarkupFields" :key="index" class="field-item">
                  <span>{{ field }}</span>
                  <v-btn icon color="error" @click="removeField(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
              <!-- Кнопка выбора -->
              <v-btn class="action-btn choose-btn" block @click="saveAndClose">
                Выбрать
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';

import { useRouter } from 'vue-router';

const router = useRouter();

const showMarkupFieldsModal = ref(false);
const currentMarkupFields = ref([]);
const newFieldName = ref('');
const selectedMarkupVersion = ref(null);

// В методе goToMarkup:
const goToMarkup = (version) => {
  selectedMarkupVersion.value = version;
  currentMarkupFields.value = version.fields ? [...version.fields] : [];
  showMarkupFieldsModal.value = true;
};

// Новые методы для работы с полями
const addField = () => {
  if (newFieldName.value.trim()) {
    currentMarkupFields.value.push(newFieldName.value.trim());
    newFieldName.value = '';
  }
};

const removeField = (index) => {
  currentMarkupFields.value.splice(index, 1);
};

const saveAndClose = () => {
  // Сохраняем поля в выбранную версию
  const projectMarkups = markups.value.find(m => m.projectId === currentProjectId.value);
  if (projectMarkups) {
    const versionIndex = projectMarkups.versions.findIndex(v => v.id === selectedMarkupVersion.value.id);
    if (versionIndex !== -1) {
      projectMarkups.versions[versionIndex].fields = [...currentMarkupFields.value];
    }
  }
  
  // Переход на страницу разметки с передачей параметров
  router.push({
    name: 'MarkupPage',
    query: {
      projectId: currentProjectId.value,
      versionId: selectedMarkupVersion.value.id,
      fields: JSON.stringify(currentMarkupFields.value)
    }
  });
  
  showMarkupFieldsModal.value = false;
};

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
      { 
        id: 1, 
        name: 'Версия 1', 
        description: 'Описание первой версии',
        fields: ['Кошка', 'Собака', 'Птица']
      },
      { 
        id: 2, 
        name: 'Версия 2', 
        description: 'Описание второй версии',
        fields: ['Автомобиль', 'Велосипед']
      },
    ],
  },
  {
    projectId: 2,
    versions: [
      { 
        id: 3, 
        name: 'Версия 1', 
        description: 'Описание первой версии',
        fields: ['Дерево', 'Цветок']
      },
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
/* Градиентный фон страницы */
.gradient-bg {
  background: linear-gradient(135deg, #f9f9f9, #eaeaea); /* Линейный градиент */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Основной контейнер страницы */
.projects-page {
  max-width: 1200px;
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Заголовок страницы */
.header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #444444; /* Темно-серый текст */
  margin-bottom: 20px;
}

/* Список проектов */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  align-items: center;
  max-height: 600px;
  overflow-y: auto;
}

/* Карточка проекта */
.project-card {
  background-color: #ffffff; /* Белый фон */
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Светлая тень */
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

/* Заголовок карточки */
.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #444444; /* Темно-серый текст */
  gap: 20px;
}

/* Дата создания */
.created-at {
  font-size: 0.9rem;
  color: #888888; /* Средне-серый */
}

/* Описание проекта */
.project-description {
  color: #444444; /* Темно-серый текст */
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Кнопки действий в карточке */
.action-btn,
.view-project-btn {
  background-color: #444444; /* Темно-серый */
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Анимация при наведении на кнопки */
.action-btn:hover,
.view-project-btn:hover {
  background-color: #333333; /* Чуть темнее серый */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Нижняя часть карточки с кнопками */
.project-actions-bottom {
  display: flex;
  justify-content: flex-end; /* Кнопки по центру или справа */
  gap: 10px;
  margin-top: auto; /* Перемещение вниз карточки */
}

/* Модальные окна */
.v-card-title {
  background-color: #ffffff; /* Белый фон */
  color: #444444 !important; /* Темно-серый текст */
  padding: 16px 24px;
}

/* Управление полями разметки */
.field-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-field-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #ffffff; /* Белый фон */
  border-radius: 8px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9; /* Светло-серый фон */
  border-radius: 6px;
  color: #444444; /* Темно-серый текст */
}

/* Кнопка "Выбрать" */
.choose-btn {
  margin-top: 20px;
  background-color: #4CAF50 !important; /* Зеленый */
  color: white !important;
}

.choose-btn:hover {
  background-color: #45a049 !important; /* Чуть темнее зеленый */
}
</style>
