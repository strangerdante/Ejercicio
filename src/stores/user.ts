import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserProfile {
  id: string;
  name: string;
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'ft';
  age: number;
  gender: 'male' | 'female';
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'hypertrophy' | 'strength' | 'endurance' | 'weightloss' | 'toning';
  injuries: {
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
    back: boolean;
    knee: boolean;
    ankle: boolean;
  };
}

export const useUserStore = defineStore('user', () => {
  // Estado
  const profile = ref<UserProfile>({
    id: '',
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

  // Getters
  const isProfileComplete = computed(() => {
    return profile.value.name !== '' && 
           profile.value.weight > 0 && 
           profile.value.height > 0 && 
           profile.value.age > 0
  })

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

  const bmiCategory = computed(() => {
    const bmiValue = bmi.value
    
    if (bmiValue < 18.5) return 'Bajo peso'
    if (bmiValue < 25) return 'Peso normal'
    if (bmiValue < 30) return 'Sobrepeso'
    if (bmiValue < 35) return 'Obesidad grado 1'
    if (bmiValue < 40) return 'Obesidad grado 2'
    return 'Obesidad grado 3'
  })

  const recommendedReps = computed(() => {
    switch (profile.value.goal) {
      case 'strength':
        return { min: 4, max: 6 }
      case 'hypertrophy':
        return { min: 8, max: 12 }
      case 'endurance':
        return { min: 15, max: 20 }
      case 'toning':
        return { min: 12, max: 15 }
      case 'weightloss':
        return { min: 12, max: 15 }
      default:
        return { min: 8, max: 12 }
    }
  })

  const recommendedSets = computed(() => {
    switch (profile.value.goal) {
      case 'strength':
        return { min: 3, max: 5 }
      case 'hypertrophy':
        return { min: 3, max: 4 }
      case 'endurance':
        return { min: 2, max: 3 }
      case 'toning':
        return { min: 3, max: 4 }
      case 'weightloss':
        return { min: 3, max: 5 }
      default:
        return { min: 3, max: 4 }
    }
  })

  const recommendedRest = computed(() => {
    switch (profile.value.goal) {
      case 'strength':
        return { min: 120, max: 180 } // segundos
      case 'hypertrophy':
        return { min: 60, max: 90 }
      case 'endurance':
        return { min: 30, max: 45 }
      case 'toning':
        return { min: 45, max: 60 }
      case 'weightloss':
        return { min: 30, max: 60 }
      default:
        return { min: 60, max: 90 }
    }
  })

  // Acciones
  function saveUserProfile(userProfile: UserProfile) {
    profile.value = { ...userProfile }
    localStorage.setItem('userProfile', JSON.stringify(profile.value))
  }

  function loadUserProfile() {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      profile.value = JSON.parse(savedProfile)
    }
  }

  function calculateStartingWeight(exercise: { difficulty: string; primaryMuscle: string }) {
    // Base weight calculated from user's body weight
    const bodyWeight = profile.value.weightUnit === 'kg' 
      ? profile.value.weight 
      : profile.value.weight * 0.453592
    
    // Base multiplier depends on gender
    const baseMultiplier = profile.value.gender === 'male' ? 0.15 : 0.10
    
    // Level multiplier
    const levelMultiplier: Record<string, number> = {
      'beginner': 0.7,
      'intermediate': 0.85,
      'advanced': 1.0
    }
    const levelValue = levelMultiplier[profile.value.level] || 0.7
    
    // Exercise difficulty multiplier
    const difficultyMultiplier: Record<string, number> = {
      'beginner': 0.9,
      'intermediate': 1.0,
      'advanced': 1.2
    }
    const difficultyValue = difficultyMultiplier[exercise.difficulty] || 1.0
    
    // Muscle group multiplier
    const muscleGroupMultiplier = exercise.primaryMuscle === 'legs' ? 1.5 : 1.0
    
    // Calculate raw weight
    let weight = bodyWeight * baseMultiplier * levelValue * difficultyValue * muscleGroupMultiplier
    
    // Round to nearest 2.5
    weight = Math.round(weight / 2.5) * 2.5
    
    // Ensure minimum weight
    const minWeight = profile.value.gender === 'male' ? 5 : 2.5
    return Math.max(weight, minWeight)
  }

  return {
    profile,
    isProfileComplete,
    bmi,
    bmiCategory,
    recommendedReps,
    recommendedSets,
    recommendedRest,
    saveUserProfile,
    loadUserProfile,
    calculateStartingWeight
  }
})