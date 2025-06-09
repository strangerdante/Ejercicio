<script setup lang="ts">
import { computed } from 'vue'
import { Exercise } from '../stores/exercises'

const props = defineProps<{
  exercise: Exercise
}>()

// Calcular estrellas de dificultad
const difficultyStars = computed(() => {
  const difficultyMap: Record<string, number> = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  }
  return difficultyMap[props.exercise.difficulty] || 1
})

// Traducir nombre de músculo
const translateMuscle = (muscle: string) => {
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

// Traducir dificultad
const translateDifficulty = computed(() => {
  const translations: Record<string, string> = {
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado'
  }
  return translations[props.exercise.difficulty] || props.exercise.difficulty
})
</script>

<template>
  <div class="card hover:shadow-lg transition-all duration-300 overflow-hidden">
    <div class="h-48 overflow-hidden">
      <img :src="exercise.gifUrl" :alt="exercise.name" class="w-full h-full object-cover" />
    </div>
    
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="font-bold text-lg">{{ exercise.name }}</h3>
        <div class="flex">
          <span v-for="i in difficultyStars" :key="`star-filled-${i}`" class="text-yellow-400">★</span>
          <span v-for="i in (3 - difficultyStars)" :key="`star-empty-${i}`" class="text-gray-300 dark:text-gray-600">★</span>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {{ translateDifficulty }}
      </div>
      
      <div class="flex flex-wrap gap-1 mb-3">
        <span class="text-xs bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
          {{ translateMuscle(exercise.primaryMuscle) }}
        </span>
        <span 
          v-for="muscle in exercise.secondaryMuscles.slice(0, 2)" 
          :key="muscle"
          class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full"
        >
          {{ translateMuscle(muscle) }}
        </span>
        <span 
          v-if="exercise.secondaryMuscles.length > 2"
          class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full"
        >
          +{{ exercise.secondaryMuscles.length - 2 }} más
        </span>
      </div>
      
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {{ exercise.description }}
      </p>
      
      <button class="btn-primary w-full">Ver detalles</button>
    </div>
  </div>
</template>