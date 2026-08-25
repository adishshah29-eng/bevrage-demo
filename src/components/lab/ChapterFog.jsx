import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ChapterFog.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 1 — "The Fog". Atmospheric Sublime pattern: the first 60% of the
// pin is empty atmosphere (haze thickening, background drifting), the final
// 40% delivers the reveal (subject + title). Depth layers at 0.05 / 0.2 /
// 0.5 / 0.85, distinct from every other chapter's set.
export default function ChapterFog() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
        isMobile: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, isMobile, reduced } = context.conditions

        if (reduced) {
          gsap.set('.fog-bg, .fog-haze, .fog-subject, .fog-dust, .fog-copy', { opacity: 1, clearProps: 'transform' })
          gsap.set('.fog-haze', { opacity: 0.15 })
          return
        }

        if (isMobile) {
          // Not pinned on mobile, so a long scrub range would keep animating
          // after the section has already scrolled out of view. Use a plain
          // scroll-coupled entrance reveal instead (transform + opacity).
          gsap.set('.fog-haze', { opacity: 0.55 })
          const tl = gsap.timeline({
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
          })
          tl.to('.fog-haze', { opacity: 0.15, duration: 0.6, ease: 'power2.out' }, 0)
          tl.fromTo('.fog-subject', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
          tl.fromTo('.fog-dust', { opacity: 0 }, { opacity: 0.5, duration: 0.5, ease: 'power2.out' }, 0.2)
          tl.fromTo('.fog-copy', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.25)
          return
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=300%',
            scrub: 0.6,
            pin: pinRef.current,
            anticipatePin: 1,
          },
        })

        // 0 -> 0.6: atmosphere thickens, background drifts (linear, per archetype)
        tl.fromTo('.fog-bg', { yPercent: -4 }, { yPercent: 4, ease: 'none', duration: 0.85 }, 0)
        tl.fromTo('.fog-haze', { opacity: 0.35 }, { opacity: 0.9, ease: 'none', duration: 0.6 }, 0)

        // 0.6 -> 1.0: the reveal — haze clears, subject + title arrive (power2.out)
        tl.to('.fog-haze', { opacity: 0.1, ease: 'power2.out', duration: 0.4 }, 0.6)
        tl.fromTo(
          '.fog-subject',
          { opacity: 0, scale: 0.92, yPercent: 6 },
          { opacity: 1, scale: 1, yPercent: 0, ease: 'power2.out', duration: 0.4 },
          0.6,
        )
        tl.fromTo('.fog-dust', { opacity: 0 }, { opacity: 0.5, ease: 'power2.out', duration: 0.35 }, 0.65)
        tl.fromTo(
          '.fog-copy',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', ease: 'power2.out', duration: 0.35 },
          0.68,
        )
        tl.fromTo('.fog-copy', { opacity: 0 }, { opacity: 1, ease: 'power2.out', duration: 0.35 }, 0.68)
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <section className="fog-chapter" ref={sectionRef}>
      <div className="fog-pin" ref={pinRef}>
        <div className="fog-bg" />
        <div className="fog-haze" />
        <div className="fog-dust" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>

        <img className="fog-subject" src="/section-stills/still_010.webp" alt="2CAL can emerging from fog" />

        <div className="fog-copy">
          <p className="fog-eyebrow">chapter one &middot; the fog</p>
          <h2 className="fog-title">somewhere between focus and fog, something shifts.</h2>
        </div>
      </div>
    </section>
  )
}
