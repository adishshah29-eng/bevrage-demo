import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

      gsap.from('.comparison-row', {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="compare" className="comparison" ref={sectionRef}>
      <div className="comparison-head">
        <p className="comparison-kicker">the honest comparison</p>
        <h2>same job, different Tuesday afternoon.</h2>
      </div>

      <div className="comparison-table">
        <div className="comparison-columns" aria-hidden="true">
          <span />
          <span>Coffee</span>
          <span className="is-accent">2CAL</span>
        </div>

        {ROWS.map((row) => (
          <div className="comparison-row" key={row.label}>
            <span className="comparison-row-label">{row.label}</span>
            <span className="comparison-row-value">{row.coffee}</span>
            <span className="comparison-row-value is-good">{row.cal}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
