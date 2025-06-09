<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExerciseStore, Exercise } from '../stores/exercises'
import { useUserStore } from '../stores/user'
import ExerciseCard from '../components/ExerciseCard.vue'

const exerciseStore = useExerciseStore()
const userStore = useUserStore()

// Filtros
const selectedMuscleGroup = ref('')
const selectedDifficulty = ref('')
const searchQuery = ref('')

// Lista de dificultades
const difficulties = [
  { id: 'beginner', name: 'Principiante' },
  { id: 'intermediate', name: 'Intermedio' },
  { id: 'advanced', name: 'Avanzado' }
]

// Ejercicios filtrados
const filteredExercises = computed(() => {
  let filtered = exerciseStore.exercises

  // Filtrar por lesiones del usuario
  filtered = exerciseStore.getSafeExercises(userStore.profile.injuries)
  
  // Filtrar por grupo muscular
  if (selectedMuscleGroup.value) {
    filtered = filtered.filter(exercise => 
      exercise.primaryMuscle === selectedMuscleGroup.value || 
      exercise.secondaryMuscles.includes(selectedMuscleGroup.value)
    )
  }
  
  // Filtrar por dificultad
  if (selectedDifficulty.value) {
    filtered = filtered.filter(exercise => 
      exercise.difficulty === selectedDifficulty.value
    )
  }
  
  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(exercise => 
      exercise.name.toLowerCase().includes(query) ||
      exercise.description.toLowerCase().includes(query) ||
      exercise.primaryMuscle.toLowerCase().includes(query) ||
      exercise.secondaryMuscles.some(m => m.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// Ejercicio detallado
const selectedExercise = ref<Exercise | null>(null)

function showExerciseDetail(exercise: Exercise) {
  selectedExercise.value = exercise
}

function closeExerciseDetail() {
  selectedExercise.value = null
}

function clearFilters() {
  selectedMuscleGroup.value = ''
  selectedDifficulty.value = ''
  searchQuery.value = ''
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Biblioteca de Ejercicios</h1>
    
    <!-- Filtros -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label for="muscle-group" class="form-label">Grupo Muscular</label>
          <select 
            id="muscle-group" 
            v-model="selectedMuscleGroup"
            class="form-select"
          >
            <option value="">Todos los grupos musculares</option>
            <option v-for="group in exerciseStore.muscleGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="difficulty" class="form-label">Nivel de Dificultad</label>
          <select 
            id="difficulty" 
            v-model="selectedDifficulty"
            class="form-select"
          >
            <option value="">Todas las dificultades</option>
            <option v-for="difficulty in difficulties" :key="difficulty.id" :value="difficulty.id">
              {{ difficulty.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="search" class="form-label">Buscar</label>
          <input 
            type="text" 
            id="search" 
            v-model="searchQuery" 
            class="form-input"
            placeholder="Nombre o músculo..."
          />
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button @click="clearFilters" class="btn-outline">
          Limpiar Filtros
        </button>
      </div>
    </div>
    
    <!-- Ejercicios -->
    <div v-if="filteredExercises.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ExerciseCard 
        v-for="exercise in filteredExercises" 
        :key="exercise.id"
        :exercise="exercise"
        @click="showExerciseDetail(exercise)"
      />
    </div>
    
    <div v-else class="card p-6 text-center">
      <p class="text-gray-700 dark:text-gray-300">
        No se encontraron ejercicios con los filtros seleccionados.
      </p>
      <button @click="clearFilters" class="btn-primary mt-4">
        Limpiar Filtros
      </button>
    </div>
    
    <!-- Modal de detalle de ejercicio -->
    <div v-if="selectedExercise" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">{{ selectedExercise.name }}</h2>
            <button @click="closeExerciseDetail" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4 h-56 overflow-hidden rounded-lg">
            <img :src="selectedExercise.gifUrl" alt="Ejercicio" class="w-full h-full object-cover" />
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold text-lg mb-2">Músculos</h3>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200">
                {{ selectedExercise.primaryMuscle === 'chest' ? 'Pecho' :
                   selectedExercise.primaryMuscle === 'back' ? 'Espalda' :
                   selectedExercise.primaryMuscle === 'shoulders' ? 'Hombros' :
                   selectedExercise.primaryMuscle === 'biceps' ? 'Bíceps' :
                   selectedExercise.primaryMuscle === 'triceps' ? 'Tríceps' :
                   selectedExercise.primaryMuscle === 'legs' ? 'Piernas' :
                   selectedExercise.primaryMuscle === 'glutes' ? 'Glúteos' : 'Core' }}
                (Principal)
              </span>
              <span 
                v-for="muscle in selectedExercise.secondaryMuscles" 
                :key="muscle"
                class="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              >
                {{ muscle === 'chest' ? 'Pecho' :
                   muscle === 'back' ? 'Espalda' :
                   muscle === 'shoulders' ? 'Hombros' :
                   muscle === 'biceps' ? 'Bíceps' :
                   muscle === 'triceps' ? 'Tríceps' :
                   muscle === 'legs' ? 'Piernas' :
                   muscle === 'glutes' ? 'Glúteos' : 'Core' }}
              </span>
            </div>
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold text-lg mb-2">Descripción</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedExercise.description }}</p>
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold text-lg mb-2">Errores comunes</h3>
            <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li v-for="(error, index) in selectedExercise.commonMistakes" :key="index" class="mb-1">
                {{ error }}
              </li>
            </ul>
          </div>
          
          <div class="mb-4">
            <h3 class="font-bold text-lg mb-2">Consejos de seguridad</h3>
            <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li v-for="(tip, index) in selectedExercise.safetyTips" :key="index" class="mb-1">
                {{ tip }}
              </li>
            </ul>
          </div>
          
          <div v-if="selectedExercise.equipment && selectedExercise.equipment.length > 0" class="mb-4">
            <h3 class="font-bold text-lg mb-2">Equipo necesario</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(item, index) in selectedExercise.equipment" 
                :key="index"
                class="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              >
                {{ item === 'bench' ? 'Banco plano' : 
                   item === 'incline-bench' ? 'Banco inclinado' : item }}
              </span>
            </div>
          </div>
          
          <div v-if="selectedExercise.contraindications && selectedExercise.contraindications.length > 0" class="mb-4">
            <h3 class="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400">Contraindicaciones</h3>
            <div class="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-800 dark:text-orange-200">
              <ul class="list-disc pl-5">
                <li v-for="(contraindication, index) in selectedExercise.contraindications" :key="index" class="mb-1">
                  {{ contraindication }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="flex justify-center mt-6">
            <button @click="closeExerciseDetail" class="btn-primary px-6">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>