import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  gifUrl: string;
  description: string;
  commonMistakes: string[];
  safetyTips: string[];
  contraindications: string[];
}

export const useExerciseStore = defineStore('exercises', () => {
  // Estado
  const exercises = ref<Exercise[]>([
    {
      id: 'db-bench-press',
      name: 'Press de Pecho con Mancuernas',
      primaryMuscle: 'chest',
      secondaryMuscles: ['triceps', 'shoulders'],
      difficulty: 'intermediate',
      equipment: ['bench'],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/01/dumbbell-bench-press-movement.gif',
      description: 'Acostado en un banco plano, sostenga las mancuernas a ambos lados del pecho con los codos doblados. Empuje las mancuernas hacia arriba hasta que los brazos estén completamente extendidos, luego bájelas lentamente.',
      commonMistakes: ['Arquear la espalda', 'Rebotar las mancuernas en el pecho', 'Extender demasiado los codos'],
      safetyTips: ['Mantener las muñecas rectas', 'Bajar controladamente', 'Mantener los glúteos en el banco'],
      contraindications: ['lesiones de hombro', 'lesiones de pecho']
    },
    {
      id: 'db-shoulder-press',
      name: 'Press de Hombros con Mancuernas',
      primaryMuscle: 'shoulders',
      secondaryMuscles: ['triceps', 'upperback'],
      difficulty: 'intermediate',
      equipment: [],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-shoulder-press.gif',
      description: 'Sentado o de pie con la espalda recta, sostenga las mancuernas a la altura de los hombros con las palmas hacia adelante. Empuje las mancuernas hacia arriba hasta que los brazos estén completamente extendidos, luego bájelas lentamente.',
      commonMistakes: ['Arquear la espalda', 'Levantar los hombros hacia las orejas', 'Usar demasiado peso'],
      safetyTips: ['Mantener el core activado', 'Empujar desde los hombros, no desde la espalda', 'Respirar correctamente'],
      contraindications: ['lesiones de hombro']
    },
    {
      id: 'db-bicep-curl',
      name: 'Curl de Bíceps con Mancuernas',
      primaryMuscle: 'biceps',
      secondaryMuscles: ['forearms'],
      difficulty: 'beginner',
      equipment: [],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/01/dumbbell-bicep-curl.gif',
      description: 'De pie con las mancuernas en las manos y los brazos extendidos a los lados, doble los codos para levantar las mancuernas hacia los hombros, manteniendo los codos cerca del cuerpo.',
      commonMistakes: ['Balancear el cuerpo', 'Usar demasiado peso', 'Levantar los codos'],
      safetyTips: ['Mantener las muñecas rectas', 'Contraer los bíceps en la parte superior', 'Mantener el control durante todo el movimiento'],
      contraindications: ['lesiones de codo', 'lesiones de muñeca']
    },
    {
      id: 'db-squat',
      name: 'Sentadilla con Mancuernas',
      primaryMuscle: 'legs',
      secondaryMuscles: ['glutes', 'core'],
      difficulty: 'beginner',
      equipment: [],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/dumbbell-goblet-squat.gif',
      description: 'De pie con los pies separados al ancho de los hombros, sostenga las mancuernas a los lados o una mancuerna frente al pecho. Flexione las rodillas y las caderas para bajar como si se sentara en una silla, luego regrese a la posición inicial.',
      commonMistakes: ['Rodillas hacia adentro', 'Levantar los talones', 'Redondear la espalda'],
      safetyTips: ['Mantener el pecho erguido', 'Empujar desde los talones', 'Mantener las rodillas alineadas con los pies'],
      contraindications: ['lesiones de rodilla', 'lesiones de espalda']
    },
    {
      id: 'db-lunges',
      name: 'Estocadas con Mancuernas',
      primaryMuscle: 'legs',
      secondaryMuscles: ['glutes', 'core'],
      difficulty: 'intermediate',
      equipment: [],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/dumbbell-lunge.gif',
      description: 'De pie con los pies juntos, sostenga las mancuernas a los lados. Dé un paso adelante con una pierna y baje la cadera hasta que ambas rodillas estén dobladas a 90 grados. Regrese a la posición inicial y repita con la otra pierna.',
      commonMistakes: ['Rodilla delantera sobrepasando el pie', 'Inclinarse demasiado hacia adelante', 'Pasos demasiado cortos'],
      safetyTips: ['Mantener el torso erguido', 'Dar pasos lo suficientemente largos', 'Mantener el control durante todo el movimiento'],
      contraindications: ['lesiones de rodilla', 'problemas de equilibrio']
    },
    {
      id: 'db-row',
      name: 'Remo con Mancuernas',
      primaryMuscle: 'back',
      secondaryMuscles: ['biceps', 'shoulders'],
      difficulty: 'intermediate',
      equipment: ['bench'],
      gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/one-arm-dumbbell-row.gif',
      description: 'Con una rodilla y una mano apoyadas en un banco, sostenga una mancuerna con el brazo extendido. Tire de la mancuerna hacia la cadera, manteniendo el codo cerca del cuerpo.',
      commonMistakes: ['Rotar el torso', 'Usar demasiado impulso', 'No retraer completamente el omóplato'],
      safetyTips: ['Mantener la espalda recta', 'Tirar con los músculos de la espalda, no con los brazos', 'Mantener el cuello neutro'],
      contraindications: ['lesiones de espalda', 'lesiones de hombro']
    }
  ])

  // Getters
  const getExercisesByMuscle = computed(() => {
    return (muscle: string) => exercises.value.filter(ex => 
      ex.primaryMuscle === muscle || ex.secondaryMuscles.includes(muscle)
    )
  })

  const getExercisesByDifficulty = computed(() => {
    return (difficulty: string) => exercises.value.filter(ex => 
      ex.difficulty === difficulty
    )
  })

  const getExerciseById = computed(() => {
    return (id: string) => exercises.value.find(ex => ex.id === id)
  })

  const getSafeExercises = computed(() => {
    return (injuries: Record<string, boolean>) => {
      const activeInjuries = Object.entries(injuries)
        .filter(([_, isActive]) => isActive)
        .map(([injury]) => injury)
      
      if (activeInjuries.length === 0) return exercises.value
      
      return exercises.value.filter(exercise => {
        return !activeInjuries.some(injury => 
          exercise.contraindications.includes(injury)
        )
      })
    }
  })

  const muscleGroups = computed(() => {
    return [
      { id: 'chest', name: 'Pecho' },
      { id: 'back', name: 'Espalda' },
      { id: 'shoulders', name: 'Hombros' },
      { id: 'biceps', name: 'Bíceps' },
      { id: 'triceps', name: 'Tríceps' },
      { id: 'legs', name: 'Piernas' },
      { id: 'glutes', name: 'Glúteos' },
      { id: 'core', name: 'Core' }
    ]
  })

  // Acciones
  function addExercise(exercise: Exercise) {
    exercises.value.push(exercise)
  }

  function removeExercise(id: string) {
    const index = exercises.value.findIndex(ex => ex.id === id)
    if (index !== -1) {
      exercises.value.splice(index, 1)
    }
  }

  return {
    exercises,
    getExercisesByMuscle,
    getExercisesByDifficulty,
    getExerciseById,
    getSafeExercises,
    muscleGroups,
    addExercise,
    removeExercise
  }
})