import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ChapterShift.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 2 — "The Shift". Sticky Narrative pattern: a pinned text track
// on the left while three ingredient reveals cross the right, each with its
// own warm/cool haze tint (Atmospheric Sublime's duality). Depth layers at
// 0.05 / 0.2 (sidebar) / 0.5 (images) / 1.0 (foreground label) — a
// different set from Chapter 1's, per the no-adjacent-repeat rule.
const STATES = [
  {
    eyebrow: '01 — caffeine',
    title: 'the lift, without the spike.',
    body: '75mg of clean tea caffeine. Enough to notice, not enough to shake.',
    image: '/section-stills/still_020.webp',
    tint: 'warm',
  },
  {
    eyebrow: "02 — lion's mane",
    title: 'clarity that holds.',
    body: 'Supports nerve growth factor and long-term focus, not a five-minute spike.',
    image: '/section-stills/still_055.webp',
    tint: 'cool',
  },
  {
    eyebrow: '03 — l-theanine',
    title: 'calm, not sedated.',
    body: 'Smooths the caffeine curve so alertness feels steady instead of wired.',
    image: '/section-stills/still_095.webp',
    tint: 'warm',
  },
]

export default function ChapterShift() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, reduced } = context.conditions
        const panels = gsap.utils.toArray('.shift-panel')
        const images = gsap.utils.toArray('.shift-image')
        const bar = document.querySelector('.shift-progress-fill')

        if (reduced) {
          gsap.set(panels, { opacity: 1 })
          gsap.set(images, { opacity: 1 })
          return
        }

        if (!isDesktop) {
          // Mobile: no pin, just scroll-coupled fade/slide reveals per panel.
          panels.forEach((panel) => {
            gsap.fromTo(
              panel,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: { trigger: panel, start: 'top 78%', toggleActions: 'play none none reverse' },
              },
            )
          })
          return
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=280%',
            scrub: 0.6,
            pin: pinRef.current,
            anticipatePin: 1,
          },
        })

        const tint = document.querySelector('.shift-tint')
        const TINT_COLORS = { warm: 'rgba(184,149,106,0.35)', cool: 'rgba(90,102,112,0.35)' }
        gsap.set(tint, { backgroundColor: TINT_COLORS[STATES[0].tint] })

        const seg = 1 / STATES.length
        STATES.forEach((state, i) => {
          const start = i * seg
          if (i > 0) {
            tl.to(panels[i - 1], { opacity: 0, duration: seg * 0.25, ease: 'none' }, start - seg * 0.15)
            tl.to(images[i - 1], { opacity: 0, duration: seg * 0.25, ease: 'none' }, start - seg * 0.15)
          }
          tl.to(panels[i], { opacity: 1, duration: seg * 0.25, ease: 'none' }, start)
          tl.fromTo(
            images[i],
            { opacity: 0, yPercent: 4 },
            { opacity: 1, yPercent: 0, duration: seg * 0.35, ease: 'none' },
            start,
          )
          tl.to(tint, { backgroundColor: TINT_COLORS[state.tint], duration: seg * 0.4, ease: 'none' }, start)
        })

        tl.to(bar, { scaleX: 1, ease: 'none', duration: 1 }, 0)
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <section className="shift-chapter" ref={sectionRef}>
      <div className="shift-pin" ref={pinRef}>
        <div className="shift-sidebar">
          <div className="shift-progress">
            <div className="shift-progress-fill" />
          </div>
          {STATES.map((state, i) => (
            <div className="shift-panel" key={state.eyebrow} style={{ opacity: i === 0 ? 1 : 0 }}>
              <p className="shift-eyebrow">{state.eyebrow}</p>
              <h2 className="shift-title">{state.title}</h2>
              <p className="shift-body">{state.body}</p>
            </div>
          ))}
        </div>

        <div className="shift-stage">
          {STATES.map((state, i) => (
            <img
              className="shift-image"
              key={state.image}
              src={state.image}
              alt=""
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}
          <div className="shift-tint" />
        </div>
      </div>
    </section>
  )
}
