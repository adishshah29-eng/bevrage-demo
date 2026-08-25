import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from '@phosphor-icons/react'
import './ChapterArrival.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 4 — "The Arrival". Closing beat: atmospheric bleed from the
// orbit chapter's warm haze into full clarity, word-stagger title reveal,
// then the CTA. Depth layers at 0.05 / 0.3 / 0.7 / 1.0 — the simplest set,
// intentional for a landing/closing chapter.
export default function ChapterArrival() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set('.arrival-word, .arrival-sub, .arrival-cta', { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        '.arrival-word',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        },
      )
      gsap.fromTo(
        '.arrival-sub',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' },
        },
      )
      gsap.fromTo(
        '.arrival-cta',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 45%' },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const words = 'the drink for brainmaxxing.'.split(' ')

  return (
    <section className="arrival-chapter" ref={sectionRef}>
      <div className="arrival-glow" />
      <p className="arrival-eyebrow">chapter four &middot; the arrival</p>
      <h2 className="arrival-title">
        {words.map((word, i) => (
          <span className="arrival-word" key={`${word}-${i}`}>
            {word}&nbsp;
          </span>
        ))}
      </h2>
      <p className="arrival-sub">Caffeine, lion&rsquo;s mane, l-theanine. Zero added sugar.</p>
      <a className="arrival-cta" href="/#shop">
        Shop 2CAL
        <ArrowRight weight="bold" size={16} />
      </a>
    </section>
  )
}
