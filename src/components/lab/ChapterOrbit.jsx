import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ChapterOrbit.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 3 — "The Object". 3D Product Orbit pattern, Tier A (CSS rotateY
// on a single flat image, not a real mesh) — so rotation is intentionally
// kept modest (-28deg to 28deg) rather than a full 360, which would show
// the image edge-on with nothing behind it. Callouts appear at specific
// points in the rotation, per the pattern's spec-callout behavior. Depth
// layers at 0.1 / 0.3 / 0.6 / 1.0 / 1.2 — a distinct set again.
const CALLOUTS = [
  { at: 0.2, label: '75mg caffeine', style: { left: '8%', top: '30%' } },
  { at: 0.5, label: 'zero added sugar', style: { right: '10%', top: '22%' } },
  { at: 0.8, label: 'peach ice tea', style: { left: '10%', bottom: '24%' } },
]

export default function ChapterOrbit() {
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
        const callouts = gsap.utils.toArray('.orbit-callout')

        if (reduced) {
          gsap.set('.orbit-mesh', { rotateY: 0 })
          gsap.set(callouts, { opacity: 1 })
          return
        }

        if (!isDesktop) {
          gsap.fromTo(
            '.orbit-mesh',
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
            },
          )
          gsap.fromTo(
            callouts,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
            },
          )
          return
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=320%',
            scrub: 0.6,
            pin: pinRef.current,
            anticipatePin: 1,
          },
        })

        tl.fromTo('.orbit-bg', { filter: 'hue-rotate(-8deg)' }, { filter: 'hue-rotate(8deg)', ease: 'none', duration: 1 }, 0)
        tl.fromTo('.orbit-shadow', { scaleX: 0.7 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        tl.fromTo('.orbit-mesh', { rotateY: -28 }, { rotateY: 28, ease: 'none', duration: 1 }, 0)

        CALLOUTS.forEach((callout, i) => {
          const el = callouts[i]
          const window_ = 0.14
          tl.fromTo(
            el,
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: window_ * 0.4, ease: 'none' },
            callout.at - window_,
          )
          tl.to(el, { opacity: 0, duration: window_ * 0.4, ease: 'none' }, callout.at + window_ * 0.6)
        })
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <section className="orbit-chapter" ref={sectionRef}>
      <div className="orbit-pin" ref={pinRef}>
        <div className="orbit-bg" />

        <div className="orbit-stage">
          <div className="orbit-shadow" />
          <img className="orbit-mesh" src="/can-cutout.png" alt="2CAL can" />
        </div>

        {CALLOUTS.map((callout) => (
          <span className="orbit-callout" key={callout.label} style={callout.style}>
            {callout.label}
          </span>
        ))}

        <div className="orbit-copy">
          <p className="orbit-eyebrow">chapter three &middot; the object</p>
          <h2 className="orbit-title">every angle earns its place in the can.</h2>
        </div>
      </div>
    </section>
  )
}
