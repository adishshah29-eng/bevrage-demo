import { useEffect, useState } from 'react'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

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
      <a className="nav-cta" href="#shop">
        Shop 2CAL
      </a>
    </header>
  )
}
