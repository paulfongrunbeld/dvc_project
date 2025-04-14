// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import StartPage from '../pages/StartPage.vue'
import MarkupPage from '../pages/MarkupPage.vue'
import ProjectDashboard from '../pages/ProjectDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'StartPage',
    component: StartPage
  },
  {
    path: '/markup',
    name: 'MarkupPage',
    component: MarkupPage
  },
  {
    path: '/projects',
    name: 'ProjectDashboard',
    component: ProjectDashboard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
