import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 200)
        }

        window.addEventListener('scroll', toggleVisibility)
        toggleVisibility()

        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`
        fixed bottom-8 right-8 z-50
        bg-linear-to-tr from-blue-700 to-blue-500
        hover:from-orange-400 hover:to-orange-500
        text-white p-4 rounded-full
        shadow-2xl
        transition-opacity duration-500
        transform
        hover:scale-110
        active:scale-95
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
        >
            <ChevronUp size={28} />
        </button>
    )
}

export default ScrollToTop
