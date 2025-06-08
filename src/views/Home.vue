<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useRoutineStore } from '../stores/routines'
import { useExerciseStore } from '../stores/exercises'

const router = useRouter()
const userStore = useUserStore()
const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()

const activeRoutines = computed(() => {
  return routineStore.routines.slice(0, 3)
})

onMounted(() => {
  userStore.loadUserProfile()
})

function goToProfile() {
  router.push('/perfil')
}

function goToGenerator() {
  router.push('/generador')
}

function goToExercises() {
  router.push('/ejercicios')
}

function goToRoutineDetail(routineId: string) {
  router.push(`/rutina/${routineId}`)
}

function deleteRoutine(event: Event, routineId: string) {
  event.stopPropagation()
  if (confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
    routineStore.deleteRoutine(routineId)
  }
}

// Calcular progreso del día
function calculateDayProgress(day: any) {
  if (!day.exercises || day.exercises.length === 0) return 0
  const completedExercises = day.exercises.filter((ex: any) => ex.completed).length
  return Math.round((completedExercises / day.exercises.length) * 100)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Bienvenida y estadísticas del perfil -->
    <section class="mb-10">
      <div v-if="userStore.isProfileComplete" class="card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold mb-2">¡Hola, {{ userStore.profile.name }}!</h1>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Bienvenido a tu entrenador personal de ejercicios con mancuernas
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div class="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">IMC</p>
                <p class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ userStore.bmi }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ userStore.bmiCategory }}</p>
              </div>
              <div class="p-3 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Objetivo</p>
                <p class="text-xl font-bold text-secondary-600 dark:text-secondary-400">
                  {{ userStore.profile.goal === 'hypertrophy' ? 'Hipertrofia' : 
                    userStore.profile.goal === 'strength' ? 'Fuerza' : 
                    userStore.profile.goal === 'endurance' ? 'Resistencia' : 
                    userStore.profile.goal === 'weightloss' ? 'Pérdida de Peso' : 'Tonificación' }}
                </p>
              </div>
              <div class="p-3 bg-accent-50 dark:bg-accent-900 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Nivel</p>
                <p class="text-xl font-bold text-accent-600 dark:text-accent-400">
                  {{ userStore.profile.level === 'beginner' ? 'Principiante' : 
                    userStore.profile.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
                </p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-sm text-gray-500 dark:text-gray-400">Recomendación</p>
                <p class="text-xl font-bold text-gray-700 dark:text-gray-300">
                  {{ userStore.recommendedReps.min }}-{{ userStore.recommendedReps.max }} reps
                </p>
              </div>
            </div>
          </div>
          <button @click="goToProfile" class="btn-outline mt-4 md:mt-0">
            Editar perfil
          </button>
        </div>
      </div>
      <div v-else class="card p-6 bg-primary-50 dark:bg-primary-900">
        <h1 class="text-2xl md:text-3xl font-bold mb-4">¡Bienvenido a GymPower!</h1>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Crea tu perfil para comenzar a generar rutinas personalizadas de ejercicios con mancuernas.
        </p>
        <button @click="goToProfile" class="btn-primary">
          Crear mi perfil
        </button>
      </div>
    </section>

    <!-- Rutinas recientes -->
    <section class="mb-10">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Mis Rutinas</h2>
        <button @click="goToGenerator" class="btn-primary">
          Nueva Rutina
        </button>
      </div>
      
      <div v-if="activeRoutines.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="routine in activeRoutines" :key="routine.id" 
             class="card p-4 cursor-pointer hover:shadow-lg transition-all duration-300 relative"
             @click="goToRoutineDetail(routine.id)">
          <button 
            @click="(e) => deleteRoutine(e, routine.id)"
            class="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200"
            title="Eliminar rutina"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <h3 class="font-bold text-lg mb-2">{{ routine.name }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ routine.daysPerWeek }} días/semana · {{ routine.minutesPerSession }} min/sesión
          </p>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Creado: {{ new Date(routine.createdAt).toLocaleDateString() }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <span v-for="day in routine.days" :key="day.id" 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="day.completed ? 
                    'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' : 
                    'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200'"
            >
              {{ day.id }}
              <span v-if="day.completed" class="ml-1">✓</span>
            </span>
          </div>
        </div>
      </div>
      
      <div v-else class="card p-6 bg-gray-50 dark:bg-gray-800 text-center">
        <p class="mb-4 text-gray-700 dark:text-gray-300">
          No tienes rutinas creadas todavía.
        </p>
        <button @click="goToGenerator" class="btn-primary">
          Crear mi primera rutina
        </button>
      </div>
    </section>

    <!-- Ejercicios -->
    <section class="mb-10">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Ejercicios Populares</h2>
        <button @click="goToExercises" class="btn-outline">
          Ver todos
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div v-for="(exercise, index) in exerciseStore.exercises.slice(0, 3)" :key="exercise.id" 
             class="card p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
             @click="goToExercises">
          <div class="mb-2 h-40 overflow-hidden rounded-lg">
            <img :src="exercise.gifUrl" alt="Ejercicio" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-bold text-lg mb-1">{{ exercise.name }}</h3>
          <div class="flex items-center mb-2">
            <div class="flex">
              <span v-for="i in ['beginner', 'intermediate', 'advanced'].indexOf(exercise.difficulty) + 1" :key="i"
                   class="text-yellow-400">★</span>
              <span v-for="i in 3 - (['beginner', 'intermediate', 'advanced'].indexOf(exercise.difficulty) + 1)" :key="i"
                   class="text-gray-300 dark:text-gray-600">★</span>
            </div>
            <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {{ exercise.difficulty === 'beginner' ? 'Principiante' : 
                 exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-1 mb-2">
            <span class="text-xs bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
              {{ exercise.primaryMuscle === 'chest' ? 'Pecho' :
                 exercise.primaryMuscle === 'back' ? 'Espalda' :
                 exercise.primaryMuscle === 'shoulders' ? 'Hombros' :
                 exercise.primaryMuscle === 'biceps' ? 'Bíceps' :
                 exercise.primaryMuscle === 'triceps' ? 'Tríceps' :
                 exercise.primaryMuscle === 'legs' ? 'Piernas' :
                 exercise.primaryMuscle === 'glutes' ? 'Glúteos' : 'Core' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>