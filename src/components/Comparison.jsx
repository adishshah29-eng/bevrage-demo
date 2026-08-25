import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, X } from '@phosphor-icons/react'
import './Comparison.css'

gsap.registerPlugin(ScrollTrigger)

const ROWS = [
  { label: 'Caffeine source', coffee: 'Roasted beans, acidic', cal: '75mg clean tea extract' },
  { label: 'The crash', coffee: 'Hard, by mid-afternoon', cal: 'None, smoothed by l-theanine' },
  { label: 'Focus type', coffee: 'Jittery, wired', cal: 'Calm, steady alertness' },
  { label: 'Added sugar', coffee: 'Depends on order', cal: 'Zero' },
  { label: 'Calories', coffee: '0-250, varies', cal: '2' },
  { label: 'Taste', coffee: 'Bitter, needs milk or sugar', cal: 'Peach iced tea' },
]

export default function Comparison() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.comparison-card', {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="compare" className="comparison" ref={sectionRef}>
      <div className="comparison-head">
        <h2>coffee vs 2CAL.</h2>
        <p>Same job, different Tuesday afternoon.</p>
      </div>

      <div className="comparison-grid">
        <article className="comparison-card">
          <h3>Coffee</h3>
          <ul>
            {ROWS.map((row) => (
              <li key={row.label}>
                <span className="comparison-row-label">{row.label}</span>
                <span className="comparison-row-value">
                  <X weight="bold" size={14} />
                  {row.coffee}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="comparison-card is-featured">
          <h3>2CAL</h3>
          <ul>
            {ROWS.map((row) => (
              <li key={row.label}>
                <span className="comparison-row-label">{row.label}</span>
                <span className="comparison-row-value is-good">
                  <Check weight="bold" size={14} />
                  {row.cal}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
