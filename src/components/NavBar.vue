<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  isDarkMode: boolean
}>()

const emit = defineEmits(['toggle-dark-mode'])
const mobileMenuOpen = ref(false)
const router = useRouter()

const routes = [
  { name: 'Home', path: '/', label: 'Inicio' },
  { name: 'UserProfile', path: '/perfil', label: 'Perfil' },
  { name: 'ExerciseLibrary', path: '/ejercicios', label: 'Ejercicios' },
  { name: 'RoutineGenerator', path: '/generador', label: 'Generar Rutina' },
  { name: 'ProgressTracker', path: '/progreso', label: 'Progreso' }
]

function toggleDarkMode() {
  emit('toggle-dark-mode')
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function navigateTo(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}
</script>

<template>
  <nav class="bg-white dark:bg-gray-800 shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between h-16">
        <!-- Logo y nombre de la app -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">GymPower</span>
          </router-link>
        </div>
        
        <!-- Navegación de escritorio -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-for="route in routes" :key="route.path">
            <router-link 
              :to="route.path" 
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="[$route.path === route.path ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
            >
              {{ route.label }}
            </router-link>
          </template>
          
          <!-- Botón de modo oscuro -->
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Cambiar tema"
          >
            <template v-if="isDarkMode">
              <!-- Icono de sol (modo claro) -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            </template>
            <template v-else>
              <!-- Icono de luna (modo oscuro) -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </template>
          </button>
        </div>
        
        <!-- Botón de menú móvil -->
        <div class="flex md:hidden items-center">
          <button 
            @click="toggleMobileMenu" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Menu principal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              :class="{ 'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Menú móvil -->
    <div class="md:hidden" :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <template v-for="route in routes" :key="route.path">
          <button
            @click="navigateTo(route.path)"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            :class="[$route.path === route.path ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700']"
          >
            {{ route.label }}
          </button>
        </template>
        
        <!-- Botón de modo oscuro en móvil -->
        <button 
          @click="toggleDarkMode"
          class="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <template v-if="isDarkMode">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <span>Modo Claro</span>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <span>Modo Oscuro</span>
          </template>
        </button>
      </div>
    </div>
  </nav>
</template>