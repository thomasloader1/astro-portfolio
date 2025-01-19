import { atom } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'

export type Locale = 'es' | 'en'

type Translations = {
  [K in Locale]: {
    nav: {
      home: string
      experience: string
      education: string
      courses: string
    }
    sections: {
      experience: string
      education: string
      courses: string
    }
  }
}

export const locale = persistentAtom<Locale>('locale', 'es')

export const setLocale = (value: Locale) => {
  locale.set(value)
}

export const t = (key: string) => {
  const currentLocale = locale.get()
  const keys = key.split('.')
  let value = translations[currentLocale]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

export const translations: Translations = {
  es: {
    nav: {
      home: 'Inicio',
      experience: 'Experiencia',
      education: 'Educación',
      courses: 'Cursos'
    },
    sections: {
      experience: 'Experiencia Laboral',
      education: 'Formación Profesional',
      courses: 'Cursos Realizados'
    }
  },
  en: {
    nav: {
      home: 'Home',
      experience: 'Experience',
      education: 'Education',
      courses: 'Courses'
    },
    sections: {
      experience: 'Work Experience',
      education: 'Education',
      courses: 'Completed Courses'
    }
  }
} 