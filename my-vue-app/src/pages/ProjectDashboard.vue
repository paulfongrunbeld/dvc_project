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
            <v-btn class="action-btn" @click="deleteProject(project.uuid)">Удалить</v-btn>
          </div>
        </div>
      </div>

      <!-- Модальное окно "Создать/Редактировать проект" -->
      <v-dialog v-model="showCreateModal" max-width="600">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ editingProject ? 'Редактировать проект' : 'Создать новый проект' }}</span>
            <v-btn class="close-btn" @click="closeCreateProjectModal">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="createForm" @submit.prevent="createOrUpdateProject">
              <v-text-field v-model="newProject.name" label="Название проекта" required
                :rules="[v => !!v || 'Обязательное поле']"></v-text-field>
              <v-textarea v-model="newProject.description" label="Описание проекта" required
                :rules="[v => !!v || 'Обязательное поле']"></v-textarea>
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
      <!-- Модальное окно "Версии разметок" -->
      <v-dialog v-model="showMarkupModal" max-width="800">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Версии разметок</span>
            <v-btn class="close-btn" @click="closeMarkupModal">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <div class="markup-cards-list">
              <div class="markup-card" v-for="version in currentMarkups" :key="version.id">
                <div class="markup-card-header">
                  <h4>{{ version.name }}</h4>
                </div>
                <p class="markup-description">Описание: {{ version.description }}</p>
                <div class="markup-actions-bottom">
                  <v-btn class="action-btn" @click="goToMarkup(version)">Перейти</v-btn>
                  <v-btn class="action-btn" @click="editMarkup(version)">Редактировать</v-btn>
                  <v-btn class="action-btn" @click="deleteMarkup(version.uuid)">Удалить</v-btn>
                </div>
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
            <v-btn class="close-btn" @click="closeCreateMarkupModal">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="createMarkupForm" @submit.prevent="createOrUpdateMarkup">
              <v-text-field v-model="newMarkup.name" label="Название версии" required
                :rules="[v => !!v || 'Обязательное поле']"></v-text-field>
              <v-textarea v-model="newMarkup.description" label="Описание версии" required
                :rules="[v => !!v || 'Обязательное поле']"></v-textarea>
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
            <v-btn class="close-btn" @click="showMarkupFieldsModal = false">Закрыть</v-btn>
          </v-card-title>
          <v-card-text>
            <div class="field-management">
              <!-- Поле для добавления новых элементов -->
              <div class="add-field-section">
                <v-text-field v-model="newFieldName" label="Новое поле" @keyup.enter="addField"></v-text-field>
                <v-btn class="action-btn" @click="addField">Добавить поле</v-btn>
              </div>
              <!-- Список существующих полей -->
              <div class="fields-list">
                <div v-for="(field, index) in currentMarkupFields" :key="index" class="field-item">
                  <span>{{ field }}</span>
                  <!-- Кнопка удаления поля -->
                  <v-btn class="close-btn" @click="removeField(index)">Удалить</v-btn>
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
import { ref, watch, getCurrentInstance, onMounted } from 'vue';

import { useRouter } from 'vue-router';
const { proxy } = getCurrentInstance();
const api = proxy.$api;
const router = useRouter();
const showMarkupFieldsModal = ref(false);
const currentMarkupFields = ref([]);
const newFieldName = ref('');
const selectedMarkupVersion = ref(null);

// В методе goToMarkup:
const goToMarkup = async (version) => {
  try {
    const markupDetails = await api.markupDescription.getMarkupDescriptionByUuid(version.uuid);
    selectedMarkupVersion.value = markupDetails;

    // Десериализация: если fields — JSON-строка, преобразуем в массив
    if (typeof markupDetails.fields === 'string') {
      try {
        currentMarkupFields.value = JSON.parse(markupDetails.fields);
      } catch (e) {
        console.warn('Ошибка десериализации полей:', e);
        currentMarkupFields.value = [];
      }
    } else {
      currentMarkupFields.value = markupDetails.fields || [];
    }

    showMarkupFieldsModal.value = true;
  } catch (err) {
    console.error('Ошибка загрузки разметки:', err);
  }
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

const saveAndClose = async () => {
  try {
    // Отправляем как массив строк
    await api.markupDescription.updateMarkupDescription(
      selectedMarkupVersion.value.uuid,
      {
        name: selectedMarkupVersion.value.name,
        description: selectedMarkupVersion.value.description,
        fields: currentMarkupFields.value, // Отправляем как массив
        projectUuid: selectedMarkupVersion.value.projectUuid
      }
    );

    router.push({
      name: 'MarkupPage',
      query: {
        projectId: currentProjectId.value,
        versionId: selectedMarkupVersion.value.uuid,
        fields: JSON.stringify(currentMarkupFields.value)
      }
    });

    showMarkupFieldsModal.value = false;
  } catch (err) {
    console.error('Ошибка сохранения полей:', err);
  }
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
  if (!valid) return;

  try {
    if (editingMarkup.value) {
      // Обновление существующей разметки
      сonsole.log(editingMarkup.value)
      const updated = await api.markupDescription.updateMarkupDescription(
        editingMarkup.value.uuid,
        {
          name: newMarkup.value.name,
          description: newMarkup.value.description,
          fields: currentMarkupFields.value, // Отправляем как массив
          projectUuid: editingMarkup.value.projectUuid
        }
      );

      if (updated) {
        await loadMarkupDescriptions(currentProjectId.value);
      }
    } else {
      // Создание новой разметки
      const newMarkupDesc = await api.markupDescription.createEmptyMarkupDescription(
        currentProjectId.value
      );
      console.log(newMarkupDesc)
      if (newMarkupDesc?.uuid) {
        const created = await api.markupDescription.updateMarkupDescription(
          newMarkupDesc.uuid,
          {
            name: newMarkup.value.name,
            description: newMarkup.value.description,
            fields: currentMarkupFields.value, // Отправляем как массив
            projectUuid: newMarkupDesc.projectUuid
          }
        );

        if (created) {
          await loadMarkupDescriptions(currentProjectId.value);
        }
      }
    }

    closeCreateMarkupModal();
  } catch (err) {
    console.error('Ошибка сохранения разметки:', err);
  }
};

const currentProjectId = ref(null);

const projects = ref([]);
const loadProjects = async () => {
  try {
    const response = await api.project.getAllProjects();
    projects.value = response.map(p => ({
      id: p.uuid, // Используем uuid как идентификатор
      uuid: p.uuid,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt
    }));
  } catch (err) {
    console.error('Ошибка загрузки проектов:', err);
  }
};

const deleteProject = async (uuid) => {
  try {
    const project = projects.value.find(p => p.uuid === uuid);
    if (!project) return;

    const fullProjectData = {
      Uuid: project.uuid,
      Name: project.name,
      Description: project.description,
      CreatedAt: project.createdAt || new Date().toISOString(),
      Removed: true
    };

    const result = await api.project.updateProject(uuid, fullProjectData);
    
    if (result?.success) {
      projects.value = projects.value.filter(p => p.uuid !== uuid);
    }
    loadProjects();
  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
  }
};

const updateProject = async (uuid, updatedData) => {
  try {
    const result = await api.project.updateProject(uuid, updatedData);
    if (result?.success) {
      const index = projects.value.findIndex(p => p.uuid === uuid);
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...updatedData
        };
      }
    }
  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
  }
};

const loadMarkupDescriptions = async (projectUuid) => {
  // try {
    const response = await api.markupDescription.getMarkupDescriptionsByProject(projectUuid);

    currentMarkups.value = response.map(m => ({
      uuid: m.uuid, 
      name: m.name,
      description: m.description,
      fields: m.fields
    }));
  // } catch (err) {
  //   console.error('Ошибка загрузки разметок:', err);
  // }
};

const viewProject = async (id) => {
  const project = projects.value.find(p => p.id === id);
  if (!project) return;
  
  currentProjectId.value = project.uuid;
  await loadMarkupDescriptions(project.uuid);
  showMarkupModal.value = true;
};

onMounted(async () => {
  await loadProjects();
});

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

const createOrUpdateProject = async () => {
  const { valid } = await createForm.value.validate();
  if (!valid) return;

  try {
    if (editingProject.value) {
      // Обновление существующего проекта
      const updated = await api.project.updateProject(editingProject.value.uuid, {
        Name: newProject.value.name,
        Description: newProject.value.description,
        Removed: editingProject.value.Removed || false
      });

      if (updated?.success) {
        const index = projects.value.findIndex(p => p.uuid === editingProject.value.uuid);
        if (index !== -1) {
          projects.value[index] = {
            ...projects.value[index],
            name: newProject.value.name,
            description: newProject.value.description
          };
        }
      }
    } else {
      // Создание нового проекта
      const emptyProject = await api.project.createEmptyProject();
      console.log(emptyProject)
      if (emptyProject?.uuid) {
        const created = await api.project.updateProject(emptyProject.uuid, {
          Name: newProject.value.name,
          Description: newProject.value.description
        });

        if (created?.success) {
          await loadProjects(); // Перезагружаем проекты
        }
      }
    }
    loadProjects()
  } catch (error) {
    console.error('Ошибка сохранения проекта:', error);
  } finally {
    closeCreateProjectModal();
  }
};


const editMarkup = (version) => {
  editingMarkup.value = { ...version }; // Сохраняем копию версии
  newMarkup.value = { ...version }; // Заполняем форму
  showCreateMarkupModal.value = true; // Открываем форму
};

// Удалить версию
const deleteMarkup = async (uuid) => {
  try {
    // Вызов нового эндпоинта для мягкого удаления
    const response = await api.markupDescription.removeMarkupDescription(uuid);
    if (response?.success) {
      // Обновление списка разметок на странице
      currentMarkups.value = currentMarkups.value.filter(m => m.uuid !== uuid);
    }
    loadMarkupDescriptions(currentProjectId.value)
  } catch (err) {
    console.error('Ошибка удаления разметки:', err);
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
  background: linear-gradient(135deg, #f9f9f9, #eaeaea);
  /* Линейный градиент */
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
  color: #444444;
  /* Темно-серый текст */
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
  background-color: #ffffff;
  /* Белый фон */
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  /* Светлая тень */
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
  color: #444444;
  /* Темно-серый текст */
  gap: 20px;
}

/* Дата создания */
.created-at {
  font-size: 0.9rem;
  color: #888888;
  /* Средне-серый */
}

/* Описание проекта */
.project-description {
  color: #444444;
  /* Темно-серый текст */
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Кнопки действий в карточке */
.action-btn,
.view-project-btn {
  background-color: #444444;
  /* Темно-серый */
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
  background-color: #333333;
  /* Чуть темнее серый */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Нижняя часть карточки с кнопками */
.project-actions-bottom {
  display: flex;
  justify-content: flex-end;
  /* Кнопки по центру или справа */
  gap: 10px;
  margin-top: auto;
  /* Перемещение вниз карточки */
}

/* Модальные окна */
.v-card-title {
  background-color: #ffffff;
  /* Белый фон */
  color: #444444 !important;
  /* Темно-серый текст */
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
  background: #ffffff;
  /* Белый фон */
  border-radius: 8px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  /* Светло-серый фон */
  border-radius: 6px;
  color: #444444;
  /* Темно-серый текст */
}

/* Кнопка "Выбрать" */
/* Стиль для кнопки "Выбрать" */
.choose-btn {
  margin-top: 20px;
  background-color: #444444 !important;
  /* Темно-серый */
  color: white !important;
  /* Белый текст */
  font-weight: bold;
  text-transform: uppercase;
  /* Заглавные буквы */
  padding: 10px 20px;
  border-radius: 8px;
}

.choose-btn:hover {
  background-color: #333333 !important;
  /* Чуть темнее серый */
}

.close-btn {
  background-color: transparent !important;
  /* Убираем фон */
  color: #444444;
  /* Темно-серый текст */
  font-size: 1rem;
  font-weight: bold;
  text-transform: none;
  /* Отключаем заглавные буквы */
  padding: 10;
  /* Убираем отступы */
  min-width: auto;
  /* Убираем минимальную ширину */
  margin-left: auto;
  /* Перемещаем кнопку вправо */
}

.close-btn:hover {
  color: #333333;
  /* Чуть темнее серый при наведении */
}

/* Список карточек версий разметки */
.markup-cards-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* Карточка версии разметки */
.markup-card {
  background-color: #ffffff;
  /* Белый фон */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  /* Легкая тень */
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

/* Заголовок карточки версии */
.markup-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #444444;
  /* Темно-серый текст */
}


/* Описание версии */
.markup-description {
  color: #444444;
  /* Темно-серый текст */
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 10px;
}

/* Нижняя часть карточки с кнопками */
.markup-actions-bottom {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
</style>
