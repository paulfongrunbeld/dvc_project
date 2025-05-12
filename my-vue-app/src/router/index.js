import { createRouter, createWebHistory } from 'vue-router'
import StartPage from '../pages/StartPage.vue'
import MarkupPage from '../pages/MarkupPage.vue'
import ProjectDashboard from '../pages/ProjectDashboard.vue'
import GalleryPage from '../pages/GalleryPage.vue'; // Страница галереи

const routes = [
  {
    path: '/',
    name: 'StartPage',
    component: StartPage
  },
  {
    path: '/markup',
    name: 'MarkupPage',
    component: MarkupPage,
    props: (route) => ({ // Добавляем передачу параметров
      projectId: route.query.projectId,
      versionId: route.query.versionId,
      fields: route.query.fields ? JSON.parse(route.query.fields) : []
    })
  },
  {
    path: '/projects',
    name: 'ProjectDashboard',
    component: ProjectDashboard
  },
  {
    path: '/gallery',
    name: 'GalleryPage',
    component: GalleryPage,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router