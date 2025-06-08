import { RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/perfil',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue')
  },
  {
    path: '/ejercicios',
    name: 'ExerciseLibrary',
    component: () => import('../views/ExerciseLibrary.vue')
  },
  {
    path: '/generador',
    name: 'RoutineGenerator',
    component: () => import('../views/RoutineGenerator.vue')
  },
  {
    path: '/progreso',
    name: 'ProgressTracker',
    component: () => import('../views/ProgressTracker.vue')
  },
  {
    path: '/rutina/:id',
    name: 'RoutineDetail',
    component: () => import('../views/RoutineDetail.vue')
  }
]

export default routes