<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useRoutineStore } from '../stores/routines'

const router = useRouter()
const userStore = useUserStore()
const routineStore = useRoutineStore()

// Datos del formulario
const daysPerWeek = ref(3)
const minutesPerSession = ref(45)
const isGenerating = ref(false)

// Validación
const isValid = computed(() => {
  return daysPerWeek.value >= 3 && daysPerWeek.value <= 6 && 
         minutesPerSession.value >= 30 && minutesPerSession.value <= 90
})

// Opciones disponibles
const daysOptions = [3, 4, 5, 6]
const minutesOptions = [30, 45, 60, 90]

// Generar rutina
async function generateRoutine() {
  if (!isValid.value) return
  
  isGenerating.value = true
  
  try {
    // Simular tiempo de generación
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generar rutina
    const routine = routineStore.generateRoutine(daysPerWeek.value, minutesPerSession.value)
    
    // Redirigir a la página de detalle
    router.push(`/rutina/${routine.id}`)
  } catch (error) {
    console.error('Error al generar rutina:', error)
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div v-if="userStore.profile?.name" class="max-w-3xl mx-auto">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Generar Rutina Personalizada</h1>
    
    <div v-if="!userStore.isProfileComplete" class="card p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/30">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200">Completa tu perfil</h3>
          <div class="mt-2 text-yellow-700 dark:text-yellow-300">
            <p>Para generar una rutina personalizada, primero debes completar tu perfil con tus datos básicos.</p>
          </div>
          <div class="mt-4">
            <button @click="router.push('/perfil')" class="btn-primary">
              Ir a mi perfil
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="card p-6">
      <h2 class="text-xl font-semibold mb-6">Configuración de Rutina</h2>
      
      <div class="mb-6">
        <label class="form-label">Días de entrenamiento por semana</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <button 
            v-for="days in daysOptions" 
            :key="days"
            class="py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-center"
            :class="daysPerWeek === days ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
            @click="daysPerWeek = days"
          >
            {{ days }} días
          </button>
        </div>
      </div>
      
      <div class="mb-6">
        <label class="form-label">Duración por sesión</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <button 
            v-for="minutes in minutesOptions" 
            :key="minutes"
            class="py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-center"
            :class="minutesPerSession === minutes ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
            @click="minutesPerSession = minutes"
          >
            {{ minutes }} min
          </button>
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h3 class="font-medium mb-3">Resumen de tu perfil</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">Nivel:</span>
            <span class="ml-2 font-medium">
              {{ userStore.profile.level === 'beginner' ? 'Principiante' : 
                 userStore.profile.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
            </span>
          </div>
          
          <div>
            <span class="text-gray-500 dark:text-gray-400">Objetivo:</span>
            <span class="ml-2 font-medium">
              {{ userStore.profile.goal === 'hypertrophy' ? 'Hipertrofia' : 
                 userStore.profile.goal === 'strength' ? 'Fuerza' : 
                 userStore.profile.goal === 'endurance' ? 'Resistencia' : 
                 userStore.profile.goal === 'weightloss' ? 'Pérdida de Peso' : 'Tonificación' }}
            </span>
          </div>
          
          <div>
            <span class="text-gray-500 dark:text-gray-400">Reps recomendadas:</span>
            <span class="ml-2 font-medium">{{ userStore.recommendedReps.min }}-{{ userStore.recommendedReps.max }}</span>
          </div>
          
          <div>
            <span class="text-gray-500 dark:text-gray-400">Series recomendadas:</span>
            <span class="ml-2 font-medium">{{ userStore.recommendedSets.min }}-{{ userStore.recommendedSets.max }}</span>
          </div>
          
          <div>
            <span class="text-gray-500 dark:text-gray-400">Descanso:</span>
            <span class="ml-2 font-medium">{{ userStore.recommendedRest.min }}-{{ userStore.recommendedRest.max }}s</span>
          </div>
        </div>
        
        <div v-if="Object.values(userStore.profile.injuries).some(injury => injury)" class="mt-3 text-sm text-orange-600 dark:text-orange-400">
          <p class="font-medium">Lesiones/condiciones registradas:</p>
          <ul class="list-disc pl-5 mt-1">
            <li v-if="userStore.profile.injuries.shoulder">Hombro</li>
            <li v-if="userStore.profile.injuries.elbow">Codo</li>
            <li v-if="userStore.profile.injuries.wrist">Muñeca</li>
            <li v-if="userStore.profile.injuries.back">Espalda</li>
            <li v-if="userStore.profile.injuries.knee">Rodilla</li>
            <li v-if="userStore.profile.injuries.ankle">Tobillo</li>
          </ul>
        </div>
      </div>
      
      <div class="flex justify-center">
        <button 
          @click="generateRoutine" 
          class="btn-primary px-8 py-3 text-lg flex items-center justify-center"
          :disabled="!isValid || isGenerating"
        >
          <template v-if="isGenerating">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando rutina...
          </template>
          <template v-else>
            Generar Rutina Personalizada
          </template>
        </button>
      </div>
    </div>
  </div>
</template>