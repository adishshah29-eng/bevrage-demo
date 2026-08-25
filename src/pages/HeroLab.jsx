import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import ChapterFog from '../components/lab/ChapterFog.jsx'
import ChapterShift from '../components/lab/ChapterShift.jsx'
import ChapterOrbit from '../components/lab/ChapterOrbit.jsx'
import ChapterArrival from '../components/lab/ChapterArrival.jsx'
import './HeroLab.css'

// Experiment sandbox for the `cinematic-scroll` skill (Atmospheric Sublime
// visual system): a 4-chapter build distinct from the production hero
// (HeroScrub.jsx) — Chapter 1 (Fog) uses the same "emerges from
// atmosphere" idea as the real hero's fog-to-focus beat, but as a layered
// CSS/still-image treatment rather than the real hero's video scrub, so
// the two don't just duplicate each other. Chapters 2-4 are patterns the
// production hero doesn't use at all (sticky narrative, CSS 3D orbit,
// word-stagger arrival).
export default function HeroLab() {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <main className="herolab">
      <Link to="/" className="herolab-back">
        <ArrowLeft weight="bold" size={16} />
        Back to 2CAL
      </Link>

      <div className="herolab-hud" aria-hidden="true">
        <span className="herolab-hud-label">scroll</span>
        <div className="herolab-hud-track">
          <div className="herolab-hud-fill" style={{ transform: `scaleY(${progress})` }} />
        </div>
      </div>

      <ChapterFog />
      <div className="herolab-breath" />
      <ChapterShift />
      <div className="herolab-breath" />
      <ChapterOrbit />
      <div className="herolab-breath" />
      <ChapterArrival />
    </main>
  )
}
