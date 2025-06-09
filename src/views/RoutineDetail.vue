<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoutineStore } from '../stores/routines'
import { useUserStore } from '../stores/user'
import RestTimer from '../components/RestTimer.vue'

const route = useRoute()
const router = useRouter()
const routineStore = useRoutineStore()
const userStore = useUserStore()

// ID de la rutina desde la URL
const routineId = computed(() => route.params.id as string)

// Obtener datos de la rutina
const routine = computed(() => routineStore.getRoutineById(routineId.value))

// Estado actual
const activeDay = ref(0)
const isTimerActive = ref(false)
const restSeconds = ref(60)
const activeExercise = ref<any>(null)
const remainingSets = ref(0)

// Exportación
const isExporting = ref(false)

onMounted(() => {
  if (!routine.value) {
    router.push('/generador')
  }
})

// Cambiar día activo
function setActiveDay(index: number) {
  activeDay.value = index
}

// Iniciar temporizador de descanso
function startRestTimer(exercise: any) {
  activeExercise.value = exercise
  restSeconds.value = exercise.rest
  remainingSets.value = exercise.remainingSets || exercise.sets
  isTimerActive.value = true
}

// Cerrar temporizador
function closeTimer() {
  isTimerActive.value = false
  activeExercise.value = null
}

// Completar una serie
function completeSet() {
  if (activeExercise.value) {
    remainingSets.value--
    activeExercise.value.remainingSets = remainingSets.value
    
    if (remainingSets.value === 0) {
      activeExercise.value.completed = true
      
      // Verificar si todos los ejercicios del día están completados
      const allExercisesCompleted = routine.value?.days[activeDay.value].exercises.every(ex => ex.completed)
      if (allExercisesCompleted) {
        routine.value!.days[activeDay.value].completed = true
      }
      
      routineStore.saveRoutine(routine.value!)
    }
  }
}

// Marcar ejercicio como completado
function toggleExerciseCompleted(exercise: any) {
  exercise.completed = !exercise.completed
  exercise.remainingSets = exercise.completed ? 0 : exercise.sets
  
  // Verificar si todos los ejercicios del día están completados
  const allExercisesCompleted = routine.value?.days[activeDay.value].exercises.every(ex => ex.completed)
  if (allExercisesCompleted) {
    routine.value!.days[activeDay.value].completed = true
  } else {
    routine.value!.days[activeDay.value].completed = false
  }
  
  routineStore.saveRoutine(routine.value!)
}

// Traducir nombre de músculo
function translateMuscle(muscle: string) {
  const translations: Record<string, string> = {
    'chest': 'Pecho',
    'back': 'Espalda',
    'shoulders': 'Hombros',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'legs': 'Piernas',
    'glutes': 'Glúteos',
    'core': 'Core',
    'forearms': 'Antebrazos',
    'upperback': 'Espalda alta'
  }
  return translations[muscle] || muscle
}

// Generar rutina con progresión
function generateProgressiveRoutine() {
  const newRoutine = routineStore.progressRoutine(routineId.value)
  if (newRoutine) {
    router.push(`/rutina/${newRoutine.id}`)
  }
}

// Exportar rutina a PDF
async function exportRoutine() {
  isExporting.value = true
  
  try {
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Aquí iría la lógica real de exportación usando html2canvas y jspdf
    alert('Funcionalidad de exportación a PDF implementada en una versión futura.')
  } catch (error) {
    console.error('Error al exportar rutina:', error)
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div v-if="routine" class="max-w-4xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">{{ routine.name }}</h1>
      
      <div class="flex items-center space-x-2 mt-3 md:mt-0">
        <button @click="generateProgressiveRoutine" class="btn-primary">
          Generar Progresión
        </button>
        
        <button @click="exportRoutine" class="btn-outline flex items-center" :disabled="isExporting">
          <template v-if="isExporting">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exportando...
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar PDF
          </template>
        </button>
      </div>
    </div>
    
    <div class="mb-6">
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
        <p>{{ routine.daysPerWeek }} días por semana · {{ routine.minutesPerSession }} minutos por sesión</p>
        <p>Creado: {{ new Date(routine.createdAt).toLocaleDateString() }}</p>
      </div>
      
      <!-- Pestañas de días -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
        <div class="flex overflow-x-auto">
          <button 
            v-for="(day, index) in routine.days" 
            :key="day.id"
            class="py-2 px-4 text-center border-b-2 font-medium text-sm whitespace-nowrap"
            :class="[
              activeDay === index ? 
                'border-primary-500 text-primary-600 dark:text-primary-400' : 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600',
              day.completed ? 'bg-green-50 dark:bg-green-900/30' : ''
            ]"
            @click="setActiveDay(index)"
          >
            {{ day.name }}
            <span v-if="day.completed" class="ml-2 text-green-500">✓</span>
          </button>
        </div>
      </div>
      
      <!-- Contenido del día activo -->
      <div v-if="routine.days[activeDay]" class="mb-8">
        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="muscle in routine.days[activeDay].focusMuscles" 
            :key="muscle"
            class="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 text-sm"
          >
            {{ translateMuscle(muscle) }}
          </span>
        </div>
        
        <!-- Ejercicios del día -->
        <div class="space-y-4">
          <div 
            v-for="exercise in routine.days[activeDay].exercises" 
            :key="exercise.exercise.id"
            class="card p-4"
            :class="{'border-l-4 border-green-500': exercise.completed}"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between">
              <div class="flex-grow mb-3 md:mb-0">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      :id="exercise.exercise.id" 
                      :checked="exercise.completed"
                      @change="toggleExerciseCompleted(exercise)"
                      class="form-checkbox"
                    />
                  </div>
                  <div class="ml-3">
                    <h3 class="font-bold text-lg">{{ exercise.exercise.name }}</h3>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span class="text-xs bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                        {{ translateMuscle(exercise.exercise.primaryMuscle) }}
                      </span>
                      <span 
                        v-for="muscle in exercise.exercise.secondaryMuscles.slice(0, 2)" 
                        :key="muscle"
                        class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full"
                      >
                        {{ translateMuscle(muscle) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-3 sm:flex sm:flex-row gap-3">
                <div class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Series</span>
                  <template v-if="exercise.completed">
                    <span class="text-green-500 text-2xl">✓</span>
                  </template>
                  <template v-else>
                    <span class="font-bold text-lg">{{ exercise.remainingSets || exercise.sets }}</span>
                  </template>
                </div>
                
                <div class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Reps</span>
                  <span class="font-bold text-lg">{{ exercise.reps }}</span>
                </div>
                
                <div class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Peso</span>
                  <span class="font-bold text-lg">{{ exercise.weight }}{{ userStore.profile.weightUnit === 'kg' ? 'kg' : 'lb' }}</span>
                </div>
                
                <button 
                  @click="startRestTimer(exercise)"
                  class="btn-primary col-span-3 sm:col-span-1"
                  :disabled="exercise.completed"
                >
                  Descanso
                </button>
              </div>
            </div>
            
            <div class="mt-3">
              <div class="flex items-center mt-2">
                <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">Descanso entre series:</span>
                <span class="font-medium">{{ exercise.rest }}s</span>
              </div>
              
              <details class="mt-2">
                <summary class="text-sm text-primary-600 dark:text-primary-400 cursor-pointer">
                  Ver instrucciones
                </summary>
                <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <p>{{ exercise.exercise.description }}</p>
                  
                  <h4 class="font-medium mt-3 mb-1">Consejos:</h4>
                  <ul class="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400">
                    <li v-for="(tip, index) in exercise.exercise.safetyTips" :key="index" class="mb-1">
                      {{ tip }}
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Temporizador de descanso -->
    <RestTimer 
      v-if="isTimerActive" 
      :seconds="restSeconds"
      :exercise="activeExercise"
      :remainingSets="remainingSets"
      @close="closeTimer"
      @completeSet="completeSet"
    />
  </div>
  
  <div v-else class="max-w-4xl mx-auto text-center py-12">
    <div class="animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto mb-6"></div>
      <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
</template>