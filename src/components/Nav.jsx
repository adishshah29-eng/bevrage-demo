import { useEffect, useState } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'
import { useTheme } from '../useTheme.js'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const heroEl = document.querySelector('.hero-wrap')
    if (!heroEl) return

    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      rootMargin: '-72px 0px 0px 0px',
      threshold: 0,
    })
    io.observe(heroEl)
    return () => io.disconnect()
  }, [])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <span className="nav-logo">2CAL</span>
      <nav className="nav-links">
        <a href="#stack">the stack</a>
        <a href="#shop">shop</a>
        <a href="#social">instagram</a>
      </nav>
      <div className="nav-right">
        <button
          type="button"
          className="nav-theme"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun weight="bold" size={16} /> : <Moon weight="bold" size={16} />}
        </button>

        <a className="nav-cta" href="#shop">
          Shop 2CAL
        </a>
      </div>
    </header>
  )
}
