import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import './HeroLab.css'

// Experiment sandbox: adapts the `cinematic-scroll` skill's Mode A
// HeroParallax component (graded depth-plane parallax + split-line title
// reveal) into React, themed for 2CAL. Kept separate from the production
// hero (HeroScrub.jsx) so techniques from the skill can be tried here
// without touching the real site.
export default function HeroLab() {
  const heroRef = useRef(null)

  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          heroEl.classList.add('is-in')
          io.unobserve(heroEl)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(heroEl)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const native = CSS.supports('animation-timeline', 'scroll()')
    const planes = Array.from(heroEl.querySelectorAll('.plane'))

    let ticking = false
    let lastY = -1

    function frame() {
      ticking = false
      if (lastY === window.scrollY) return
      lastY = window.scrollY
      for (const el of planes) {
        if (el.offsetParent === null) continue
        const depth = parseFloat(el.dataset.depth)
        el.style.transform = `translate3d(0,${-window.scrollY * depth * 0.12}px,0)`
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(frame)
      }
    }

    function sync() {
      const off = reduce.matches || native
      window.removeEventListener('scroll', onScroll)
      if (off) {
        for (const el of planes) el.style.transform = ''
        return
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      frame()
    }

    sync()
    reduce.addEventListener('change', sync)
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  return (
    <main className="herolab">
      <Link to="/" className="herolab-back">
        <ArrowLeft weight="bold" size={16} />
        Back to 2CAL
      </Link>

      <div className="herolab-spacer">scroll down</div>

      <section className="herolab-hero" id="herolab-hero" ref={heroRef}>
        <div className="herolab-frame">
          <div className="plane" data-depth="0.16" aria-hidden="true" />
          <div className="plane" data-depth="0.34" aria-hidden="true" />
          <div className="plane" data-depth="0.62" aria-hidden="true">
            <img className="herolab-subject" src="/can-cutout.png" alt="" />
          </div>

          <div className="herolab-copy">
            <p className="herolab-eyebrow">cinematic-scroll experiment</p>
            <h1 className="herolab-title">
              <span className="line">
                <span>Four depth planes,</span>
              </span>
              <span className="line">
                <span>
                  one <span className="accent">tracking shot</span>.
                </span>
              </span>
            </h1>
            <p className="herolab-summary">
              Background, atmosphere, subject and a foreground detail travel at graded scroll
              rates, so the frame reads as deep space instead of a flat image.
            </p>
          </div>

          <div className="plane" data-depth="1.18" aria-hidden="true">
            <span className="herolab-chip">Foreground &middot; 1.18&times;</span>
          </div>
        </div>
      </section>

      <div className="herolab-spacer">end of experiment</div>
    </main>
  )
}
