<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const props = defineProps<{
  seconds: number
  exercise: any
  remainingSets: number
}>()

const emit = defineEmits(['close', 'completeSet'])

const timeLeft = ref(props.seconds)
const intervalId = ref<number | null>(null)

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const progressPercent = computed(() => {
  return (timeLeft.value / props.seconds) * 100
})

function startTimer() {
  intervalId.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 1
    } else {
      if (intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
      }
      // Reproducir sonido de finalización (se implementaría aquí)
    }
  }, 1000)
}

function resetTimer() {
  timeLeft.value = props.seconds
  if (!intervalId.value) {
    startTimer()
  }
}

function closeTimer() {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
  emit('close')
}

function completeSet() {
  emit('completeSet')
  closeTimer()
}

function addTime(seconds: number) {
  timeLeft.value += seconds
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-2xl font-bold">Temporizador de Descanso</h2>
          <button @click="closeTimer" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="exercise" class="mb-4 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">Descanso para</p>
          <p class="font-medium">{{ exercise.exercise.name }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Series restantes: {{ remainingSets }}
          </p>
        </div>
        
        <div class="relative mb-6">
          <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary-500 transition-all duration-1000 ease-linear"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
        
        <div class="text-center mb-6">
          <span class="text-5xl font-bold">{{ formattedTime }}</span>
        </div>
        
        <div class="flex justify-center space-x-3 mb-6">
          <button 
            @click="resetTimer" 
            class="btn-outline px-6"
          >
            Reiniciar
          </button>

          <button
            v-if="remainingSets > 0"
            @click="completeSet"
            class="btn-success px-6"
          >
            Completar Serie
          </button>
        </div>
        
        <div class="flex justify-center space-x-2">
          <button 
            @click="addTime(-5)" 
            class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
            :disabled="timeLeft <= 5"
          >
            -5s
          </button>
          
          <button 
            @click="addTime(-10)" 
            class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
            :disabled="timeLeft <= 10"
          >
            -10s
          </button>
          
          <button 
            @click="addTime(10)" 
            class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
          >
            +10s
          </button>
          
          <button 
            @click="addTime(30)" 
            class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
          >
            +30s
          </button>
        </div>
      </div>
    </div>
  </div>
</template>