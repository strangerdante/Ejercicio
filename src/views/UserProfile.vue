<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, UserProfile } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// Datos del formulario
const profile = ref<UserProfile>({
  id: Date.now().toString(),
  name: '',
  weight: 0,
  weightUnit: 'kg',
  height: 0,
  heightUnit: 'cm',
  age: 0,
  gender: 'male',
  level: 'beginner',
  goal: 'hypertrophy',
  injuries: {
    shoulder: false,
    elbow: false,
    wrist: false,
    back: false,
    knee: false,
    ankle: false
  }
})

// Calcular IMC en tiempo real
const bmi = computed(() => {
  if (profile.value.weight <= 0 || profile.value.height <= 0) return 0
  
  let weightKg = profile.value.weight
  let heightM = profile.value.height / 100
  
  // Convertir a unidades métricas si es necesario
  if (profile.value.weightUnit === 'lb') {
    weightKg = profile.value.weight * 0.453592
  }
  
  if (profile.value.heightUnit === 'ft') {
    heightM = profile.value.height * 0.0254
  }
  
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1))
})

// Categoría de IMC
const bmiCategory = computed(() => {
  const bmiValue = bmi.value
  
  if (bmiValue < 18.5) return 'Bajo peso'
  if (bmiValue < 25) return 'Peso normal'
  if (bmiValue < 30) return 'Sobrepeso'
  if (bmiValue < 35) return 'Obesidad grado 1'
  if (bmiValue < 40) return 'Obesidad grado 2'
  return 'Obesidad grado 3'
})

// Color de IMC
const bmiColor = computed(() => {
  const bmiValue = bmi.value
  
  if (bmiValue < 18.5) return 'text-blue-500'
  if (bmiValue < 25) return 'text-green-500'
  if (bmiValue < 30) return 'text-yellow-500'
  if (bmiValue < 35) return 'text-orange-500'
  return 'text-red-500'
})

// Niveles
const levels = [
  { id: 'beginner', name: 'Principiante', description: 'Menos de 1 año de entrenamiento regular' },
  { id: 'intermediate', name: 'Intermedio', description: '1-3 años de entrenamiento regular' },
  { id: 'advanced', name: 'Avanzado', description: 'Más de 3 años de entrenamiento regular' }
]

// Objetivos
const goals = [
  { id: 'hypertrophy', name: 'Hipertrofia', description: 'Aumentar el tamaño muscular' },
  { id: 'strength', name: 'Fuerza', description: 'Aumentar la fuerza máxima' },
  { id: 'endurance', name: 'Resistencia', description: 'Mejorar la resistencia muscular' },
  { id: 'weightloss', name: 'Pérdida de Peso', description: 'Reducir grasa corporal' },
  { id: 'toning', name: 'Tonificación', description: 'Mejorar la definición muscular' }
]

// Lesiones
const injuries = [
  { id: 'shoulder' as const, name: 'Hombro', description: 'Limitación en movimientos de hombro' },
  { id: 'elbow' as const, name: 'Codo', description: 'Dolor o limitación en el codo' },
  { id: 'wrist' as const, name: 'Muñeca', description: 'Dolor o limitación en la muñeca' },
  { id: 'back' as const, name: 'Espalda', description: 'Problemas de espalda o columna' },
  { id: 'knee' as const, name: 'Rodilla', description: 'Dolor o limitación en las rodillas' },
  { id: 'ankle' as const, name: 'Tobillo', description: 'Dolor o limitación en los tobillos' }
]

// Función helper para acceder a las injuries de forma type-safe
function getInjuryValue(injuryId: string): boolean {
  return profile.value.injuries[injuryId as keyof typeof profile.value.injuries] || false
}

function setInjuryValue(injuryId: string, value: boolean): void {
  ;(profile.value.injuries as any)[injuryId] = value
}

onMounted(() => {
  // Cargar perfil existente si existe
  userStore.loadUserProfile()
  if (userStore.isProfileComplete) {
    profile.value = { ...userStore.profile }
  }
})

// Guardar perfil
function saveProfile() {
  if (!validateForm()) return
  
  userStore.saveUserProfile(profile.value)
  router.push('/')
}

// Validar formulario
function validateForm() {
  if (!profile.value.name) {
    alert('Por favor, ingresa tu nombre')
    return false
  }
  
  if (profile.value.weight <= 0) {
    alert('Por favor, ingresa un peso válido')
    return false
  }
  
  if (profile.value.height <= 0) {
    alert('Por favor, ingresa una estatura válida')
    return false
  }
  
  if (profile.value.age <= 0) {
    alert('Por favor, ingresa una edad válida')
    return false
  }
  
  return true
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Mi Perfil</h1>
    
    <div class="card p-6">
      <form @submit.prevent="saveProfile">
        <!-- Datos personales -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Datos Personales</h2>
          
          <div class="form-group">
            <label for="name" class="form-label">Nombre</label>
            <input 
              type="text" 
              id="name" 
              v-model="profile.name" 
              class="form-input"
              placeholder="Tu nombre"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="age" class="form-label">Edad</label>
              <input 
                type="number" 
                id="age" 
                v-model.number="profile.age" 
                class="form-input"
                min="16"
                max="99"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Género</label>
              <div class="flex mt-2">
                <label class="inline-flex items-center mr-4">
                  <input 
                    type="radio" 
                    v-model="profile.gender" 
                    value="male"
                    class="form-radio"
                  />
                  <span class="ml-2">Masculino</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    v-model="profile.gender" 
                    value="female"
                    class="form-radio"
                  />
                  <span class="ml-2">Femenino</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="weight" class="form-label">Peso</label>
              <div class="flex">
                <input 
                  type="number" 
                  id="weight" 
                  v-model.number="profile.weight" 
                  class="form-input rounded-r-none flex-grow"
                  step="0.1"
                  min="30"
                  max="250"
                />
                <select 
                  v-model="profile.weightUnit"
                  class="form-select w-20 rounded-l-none border-l-0"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="height" class="form-label">Estatura</label>
              <div class="flex">
                <input 
                  type="number" 
                  id="height" 
                  v-model.number="profile.height" 
                  class="form-input rounded-r-none flex-grow"
                  min="100"
                  max="250"
                />
                <select 
                  v-model="profile.heightUnit"
                  class="form-select w-20 rounded-l-none border-l-0"
                >
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- IMC calculado -->
          <div v-if="bmi > 0" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">Índice de Masa Corporal (IMC):</span>
              <span :class="bmiColor" class="font-bold text-lg">{{ bmi }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Categoría: <span :class="bmiColor">{{ bmiCategory }}</span>
            </p>
          </div>
        </div>
        
        <!-- Nivel de experiencia -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Nivel de Experiencia</h2>
          
          <div class="space-y-3">
            <div 
              v-for="level in levels" 
              :key="level.id"
              class="p-3 border rounded-lg cursor-pointer transition-all duration-200"
              :class="profile.level === level.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'"
              @click="profile.level = level.id as 'beginner' | 'intermediate' | 'advanced'"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <input 
                    type="radio" 
                    :id="level.id" 
                    :value="level.id" 
                    v-model="profile.level"
                    class="form-radio"
                  />
                </div>
                <label :for="level.id" class="ml-3 cursor-pointer flex-grow">
                  <span class="block font-medium text-gray-900 dark:text-gray-100">{{ level.name }}</span>
                  <span class="block text-sm text-gray-500 dark:text-gray-400">{{ level.description }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Objetivo de entrenamiento -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Objetivo de Entrenamiento</h2>
          
          <div class="space-y-3">
            <div 
              v-for="goal in goals" 
              :key="goal.id"
              class="p-3 border rounded-lg cursor-pointer transition-all duration-200"
              :class="profile.goal === goal.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'"
              @click="profile.goal = goal.id as 'hypertrophy' | 'strength' | 'endurance' | 'weightloss' | 'toning'"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <input 
                    type="radio" 
                    :id="goal.id" 
                    :value="goal.id" 
                    v-model="profile.goal"
                    class="form-radio"
                  />
                </div>
                <label :for="goal.id" class="ml-3 cursor-pointer flex-grow">
                  <span class="block font-medium text-gray-900 dark:text-gray-100">{{ goal.name }}</span>
                  <span class="block text-sm text-gray-500 dark:text-gray-400">{{ goal.description }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Condiciones especiales / Lesiones -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Condiciones Especiales</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Selecciona si tienes alguna limitación o lesión para adaptar tus rutinas
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="injury in injuries" 
              :key="injury.id"
              class="p-3 border rounded-lg"
              :class="getInjuryValue(injury.id) ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-200 dark:border-gray-700'"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    :id="injury.id" 
                    :checked="getInjuryValue(injury.id)"
                    @change="setInjuryValue(injury.id, ($event.target as HTMLInputElement).checked)"
                    class="form-checkbox text-orange-500"
                  />
                </div>
                <label :for="injury.id" class="ml-3 cursor-pointer">
                  <span class="block font-medium text-gray-900 dark:text-gray-100">{{ injury.name }}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{{ injury.description }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="flex justify-end">
          <button type="submit" class="btn-primary px-6">Guardar Perfil</button>
        </div>
      </form>
    </div>
  </div>
</template>