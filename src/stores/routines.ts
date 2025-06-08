import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { useExerciseStore, Exercise } from './exercises'

export interface RoutineExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  completed: boolean;
  remainingSets?: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  focusMuscles: string[];
  exercises: RoutineExercise[];
  completed?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  createdAt: string;
  days: WorkoutDay[];
  daysPerWeek: number;
  minutesPerSession: number;
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  dayId: string;
  date: string;
  exercises: {
    exerciseId: string;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
    }[];
  }[];
}

export const useRoutineStore = defineStore('routines', () => {
  // Stores
  const userStore = useUserStore()
  const exerciseStore = useExerciseStore()
  
  // Estado
  const routines = ref<Routine[]>([])
  const workoutLogs = ref<WorkoutLog[]>([])
  
  // Getters
  const getRoutineById = computed(() => {
    return (id: string) => routines.value.find(routine => routine.id === id)
  })
  
  const getWorkoutLogs = computed(() => {
    return (routineId: string) => workoutLogs.value.filter(log => log.routineId === routineId)
  })
  
  // Acciones
  function saveRoutine(routine: Routine) {
    const index = routines.value.findIndex(r => r.id === routine.id)
    if (index !== -1) {
      routines.value[index] = routine
    } else {
      routines.value.push(routine)
    }
    saveToLocalStorage()
  }
  
  function deleteRoutine(id: string) {
    const index = routines.value.findIndex(r => r.id === id)
    if (index !== -1) {
      routines.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  function logWorkout(log: WorkoutLog) {
    workoutLogs.value.push(log)
    saveToLocalStorage()
  }
  
  function generateRoutine(daysPerWeek: number, minutesPerSession: number): Routine {
    const userProfile = userStore.profile
    const safeExercises = exerciseStore.getSafeExercises(userProfile.injuries)
    
    // Determine muscle group split based on days per week
    const muscleSplits = getMuscleGroupSplit(daysPerWeek)
    
    // Create new routine
    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: `Rutina ${userProfile.goal === 'hypertrophy' ? 'Hipertrofia' : 
             userProfile.goal === 'strength' ? 'Fuerza' : 
             userProfile.goal === 'endurance' ? 'Resistencia' : 
             userProfile.goal === 'weightloss' ? 'Pérdida de Peso' : 'Tonificación'}`,
      createdAt: new Date().toISOString(),
      days: [],
      daysPerWeek,
      minutesPerSession
    }
    
    // Generate workout days
    muscleSplits.forEach((muscles, index) => {
      // Determine number of exercises based on minutes per session
      const exercisesCount = Math.floor(minutesPerSession / 10)
      
      // Get exercises for these muscle groups
      const dayExercises: RoutineExercise[] = []
      
      muscles.forEach(muscle => {
        const muscleExercises = safeExercises.filter(ex => 
          ex.primaryMuscle === muscle || ex.secondaryMuscles.includes(muscle)
        )
        
        // Sort by difficulty level aligned with user level
        const sortedExercises = muscleExercises.sort((a, b) => {
          const levelMap = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 }
          const userLevelValue = levelMap[userProfile.level]
          const aLevelValue = levelMap[a.difficulty]
          const bLevelValue = levelMap[b.difficulty]
          
          return Math.abs(aLevelValue - userLevelValue) - Math.abs(bLevelValue - userLevelValue)
        })
        
        // Select top exercises
        const selectedExercises = sortedExercises.slice(0, Math.max(1, Math.floor(exercisesCount / muscles.length)))
        
        // Add to day exercises
        selectedExercises.forEach(ex => {
          const weight = userStore.calculateStartingWeight(ex)
          const recommendedSets = userStore.recommendedSets
          const recommendedReps = userStore.recommendedReps
          const recommendedRest = userStore.recommendedRest
          
          dayExercises.push({
            exercise: ex,
            sets: recommendedSets?.min || 3,
            reps: recommendedReps?.min || 8,
            weight,
            rest: recommendedRest?.min || 60,
            completed: false,
            remainingSets: recommendedSets?.min || 3
          })
        })
      })
      
      // Create workout day
      const day: WorkoutDay = {
        id: `Día ${index + 1}`,
        name: `Día ${index + 1}: ${muscles.map(m => translateMuscle(m)).join(' y ')}`,
        focusMuscles: muscles,
        exercises: dayExercises,
        completed: false
      }
      
      newRoutine.days.push(day)
    })
    
    // Save the new routine
    saveRoutine(newRoutine)
    
    return newRoutine
  }
  
  function getMuscleGroupSplit(daysPerWeek: number): string[][] {
    switch (daysPerWeek) {
      case 3:
        return [
          ['chest', 'triceps'], 
          ['back', 'biceps'], 
          ['legs', 'shoulders']
        ]
      case 4:
        return [
          ['chest'], 
          ['back'], 
          ['legs'], 
          ['shoulders', 'arms']
        ]
      case 5:
        return [
          ['chest'], 
          ['back'], 
          ['legs'], 
          ['shoulders'], 
          ['arms', 'core']
        ]
      case 6:
        return [
          ['chest'], 
          ['back'], 
          ['legs'], 
          ['shoulders'], 
          ['arms'], 
          ['core', 'glutes']
        ]
      default:
        return [
          ['chest', 'triceps'], 
          ['back', 'biceps'], 
          ['legs', 'shoulders']
        ]
    }
  }
  
  function translateMuscle(muscle: string): string {
    const translations: { [key: string]: string } = {
      'chest': 'Pecho',
      'back': 'Espalda',
      'shoulders': 'Hombros',
      'biceps': 'Bíceps',
      'triceps': 'Tríceps',
      'legs': 'Piernas',
      'glutes': 'Glúteos',
      'core': 'Core',
      'arms': 'Brazos',
      'forearms': 'Antebrazos',
      'upperback': 'Espalda Alta'
    }
    return translations[muscle] || muscle
  }
  
  function progressRoutine(routineId: string): Routine | null {
    const routine = getRoutineById.value(routineId)
    if (!routine) return null
    
    const newRoutine = JSON.parse(JSON.stringify(routine)) as Routine
    newRoutine.id = Date.now().toString()
    newRoutine.name = routine.name.includes('(Progresión)') ? routine.name : `${routine.name} (Progresión)`
    newRoutine.createdAt = new Date().toISOString()
    
    // Increase weights by 2.5-5% for each exercise
    newRoutine.days.forEach(day => {
      // Reset day completion status
      day.completed = false
      
      day.exercises.forEach(ex => {
        // Calculate progressive overload
        const progressPercent = userStore.profile.level === 'beginner' ? 0.025 : 
                              userStore.profile.level === 'intermediate' ? 0.035 : 0.05
        
        // Increase weight
        ex.weight = Math.round((ex.weight * (1 + progressPercent)) / 2.5) * 2.5
        
        // Adjust reps based on goal
        if (userStore.profile.goal === 'strength') {
          ex.reps = Math.min(ex.reps + 1, userStore.recommendedReps?.max ?? 12)
        } else if (userStore.profile.goal === 'hypertrophy') {
          ex.reps = Math.min(ex.reps + 1, userStore.recommendedReps?.max ?? 12)
        } else {
          ex.reps = Math.min(ex.reps + 2, userStore.recommendedReps?.max ?? 15)
        }
        
        // Reset completion status and remaining sets
        ex.completed = false
        ex.remainingSets = ex.sets
      })
    })
    
    saveRoutine(newRoutine)
    return newRoutine
  }
  
  function saveToLocalStorage() {
    localStorage.setItem('routines', JSON.stringify(routines.value))
    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs.value))
  }
  
  function loadFromLocalStorage() {
    const savedRoutines = localStorage.getItem('routines')
    if (savedRoutines) {
      routines.value = JSON.parse(savedRoutines)
    }
    
    const savedLogs = localStorage.getItem('workoutLogs')
    if (savedLogs) {
      workoutLogs.value = JSON.parse(savedLogs)
    }
  }
  
  // Inicializar datos desde localStorage al cargar la aplicación
  loadFromLocalStorage()
  
  return {
    routines,
    workoutLogs,
    getRoutineById,
    getWorkoutLogs,
    saveRoutine,
    deleteRoutine,
    logWorkout,
    generateRoutine,
    progressRoutine,
    translateMuscle
  }
})