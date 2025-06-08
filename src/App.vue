<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import NavBar from './components/NavBar.vue'

const isDarkMode = ref(false)
const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  // Cargar preferencia de modo oscuro
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = JSON.parse(savedDarkMode)
    applyDarkMode()
  }
  
  // Cargar datos de usuario
  userStore.loadUserProfile()
  
  // Redirigir a perfil si no hay datos de usuario
  if (!userStore.isProfileComplete) {
    router.push('/perfil')
  }
})

watch(isDarkMode, () => {
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
  applyDarkMode()
})

function applyDarkMode() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar :isDarkMode="isDarkMode" @toggle-dark-mode="toggleDarkMode" />
    
    <main class="flex-grow container mx-auto px-4 py-6">
      <router-view />
    </main>
    
    <footer class="bg-gray-100 dark:bg-gray-800 py-4">
      <div class="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>GymPower App - Rutinas personalizadas con mancuernas © {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>