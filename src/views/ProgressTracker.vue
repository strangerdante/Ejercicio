<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutineStore } from '../stores/routines'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const router = useRouter()
const routineStore = useRoutineStore()

// Estado
const selectedRoutineId = ref('')

// Rutinas disponibles
const availableRoutines = computed(() => {
  return routineStore.routines
})

// Registros de entrenamiento para la rutina seleccionada
const workoutLogs = computed(() => {
  if (!selectedRoutineId.value) return []
  return routineStore.getWorkoutLogs(selectedRoutineId.value)
})

// Datos para el gráfico de progreso
const progressChartData = computed(() => {
  if (!selectedRoutineId.value) return null

  const routine = routineStore.getRoutineById(selectedRoutineId.value)
  if (!routine) return null

  // Obtener los últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  // Calcular el progreso diario
  const progressData = last7Days.map(() => {
    const dayProgress = routine.days.map(day => {
      const exercisesCompleted = day.exercises.filter(ex => ex.completed).length
      return (exercisesCompleted / day.exercises.length) * 100
    })
    return dayProgress.reduce((acc, curr) => acc + curr, 0) / routine.days.length
  })

  return {
    labels: last7Days.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Progreso Diario (%)',
        data: progressData,
        borderColor: '#0066ff',
        backgroundColor: '#0066ff20',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

// Estadísticas generales
const statistics = computed(() => {
  if (!selectedRoutineId.value) return null

  const routine = routineStore.getRoutineById(selectedRoutineId.value)
  if (!routine) return null

  // Calcular volumen total (series * repeticiones * peso)
  let totalVolume = 0
  let completedExercises = 0
  let totalExercises = 0

  routine.days.forEach(day => {
    day.exercises.forEach(exercise => {
      const volume = exercise.sets * exercise.reps * exercise.weight
      totalVolume += volume
      
      if (exercise.completed) completedExercises++
      totalExercises++
    })
  })

  // Calcular peso promedio
  const averageWeight = totalExercises > 0 
    ? Math.round(totalVolume / (totalExercises * routine.days[0].exercises[0].sets * routine.days[0].exercises[0].reps))
    : 0

  // Calcular consistencia
  const consistency = totalExercises > 0
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0

  return {
    totalVolume,
    averageWeight,
    consistency
  }
})

// Cargar datos
onMounted(() => {
  if (availableRoutines.value.length > 0) {
    selectedRoutineId.value = availableRoutines.value[0].id
  }
})

// Ir a detalles de rutina
function goToRoutineDetail(routineId: string) {
  router.push(`/rutina/${routineId}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Seguimiento de Progreso</h1>
    
    <div v-if="availableRoutines.length === 0" class="card p-6 text-center">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        No tienes rutinas creadas para hacer seguimiento de progreso.
      </p>
      <button @click="router.push('/generador')" class="btn-primary">
        Crear mi primera rutina
      </button>
    </div>
    
    <div v-else>
      <div class="card p-6 mb-6">
        <div class="form-group">
          <label for="routine-select" class="form-label">Seleccionar Rutina</label>
          <select 
            id="routine-select" 
            v-model="selectedRoutineId"
            class="form-select"
          >
            <option v-for="routine in availableRoutines" :key="routine.id" :value="routine.id">
              {{ routine.name }} (Creada: {{ new Date(routine.createdAt).toLocaleDateString() }})
            </option>
          </select>
        </div>
        
        <div v-if="selectedRoutineId" class="mt-4">
          <button @click="goToRoutineDetail(selectedRoutineId)" class="btn-primary">
            Ver Detalles de Rutina
          </button>
        </div>
      </div>
      
      <div v-if="selectedRoutineId && statistics" class="card p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Análisis de Progreso</h2>
        
        <div v-if="progressChartData" class="mb-6">
          <Line 
            :data="progressChartData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }"
            class="h-64"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
            <h3 class="font-medium mb-2">Volumen Total</h3>
            <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ statistics.totalVolume.toLocaleString() }} kg
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Series × Repeticiones × Peso
            </p>
          </div>
          
          <div class="p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
            <h3 class="font-medium mb-2">Peso Promedio</h3>
            <p class="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
              {{ statistics.averageWeight }} kg
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Por ejercicio
            </p>
          </div>
          
          <div class="p-4 bg-accent-50 dark:bg-accent-900 rounded-lg">
            <h3 class="font-medium mb-2">Consistencia</h3>
            <p class="text-2xl font-bold text-accent-600 dark:text-accent-400">
              {{ statistics.consistency }}%
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Ejercicios completados
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="selectedRoutineId" class="card p-6">
        <h2 class="text-xl font-semibold mb-4">Historial de Entrenamientos</h2>
        
        <div v-if="workoutLogs.length > 0">
          <div class="space-y-4">
            <div v-for="log in workoutLogs" :key="log.id" class="border rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <div>
                  <span class="font-medium">{{ new Date(log.date).toLocaleDateString() }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {{ log.dayId }}
                  </span>
                </div>
              </div>
              
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <div v-for="exercise in log.exercises" :key="exercise.exerciseId" class="mb-2">
                  <div class="flex items-center">
                    <span class="font-medium">{{ exercise.exerciseId }}</span>
                    <span class="ml-2">
                      {{ exercise.sets.filter(set => set.completed).length }}/{{ exercise.sets.length }} series completadas
                    </span>
                  </div>
                  <div class="text-xs mt-1">
                    Peso máximo: {{ Math.max(...exercise.sets.map(set => set.weight)) }}kg
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Aún no has registrado entrenamientos para esta rutina.
          </p>
          <button @click="goToRoutineDetail(selectedRoutineId)" class="btn-primary">
            Ir a Entrenar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>