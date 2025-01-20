import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > 100
      setIsScrolled(show)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Botones iniciales */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <nav className="flex items-center gap-6">
            <a href="#experience" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Experiencia
            </a>
            <a href="#education" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Educación
            </a>
            <a href="#courses" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Cursos
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Navegación fija al scrollear */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isScrolled ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="#" className="text-lg font-semibold text-gray-900 dark:text-white">
            GTG
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#experience" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Experiencia
            </a>
            <a href="#education" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Educación
            </a>
            <a href="#courses" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
              Cursos
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </div>
    </>
  )
} 