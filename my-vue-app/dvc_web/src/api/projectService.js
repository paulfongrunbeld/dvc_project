// src/services/projectService.js
import axios from 'axios';

// Базовый URL API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Поменяй на свой URL бекенда
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получить все проекты
export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    throw error;
  }
};

// Получить проект по ID
export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении проекта с ID ${id}:`, error);
    throw error;
  }
};

// Создать новый проект
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
    throw error;
  }
};

// Обновить проект по ID
export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении проекта с ID ${id}:`, error);
    throw error;
  }
};

// Удалить проект по ID
export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении проекта с ID ${id}:`, error);
    throw error;
  }
};
