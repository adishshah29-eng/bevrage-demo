import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createCanScene, supportsWebGL } from './canScene.js'
import './ChapterOrbit.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 3 — "The Object". Real 3D Product Orbit (Tier B: Three.js + GLTF,
// via canScene.js, shared with ChapterFog) — a real mesh, so the can turns
// a full 360deg. It also drifts laterally left-to-right while it turns
// (not just spinning in place), a smaller echo of Chapter 1's arrival
// motion. Pinned for the section's whole scroll range on desktop, so the
// callouts always appear while pinned, never mid-scroll.
const CALLOUTS = [
  { at: 0.18, label: '75mg caffeine', style: { left: '8%', top: '28%' } },
  { at: 0.5, label: 'zero added sugar', style: { right: '8%', top: '24%' } },
  { at: 0.82, label: 'peach ice tea', style: { left: '10%', bottom: '22%' } },
]

export default function ChapterOrbit() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const [webglOK, setWebglOK] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setWebglOK(supportsWebGL())
  }, [])

  useLayoutEffect(() => {
    if (!webglOK) return
    const container = canvasWrapRef.current
    if (!container) return

    let disposed = false
    let mm

    const canScene = createCanScene(container, {
      onLoad: (model) => {
        if (disposed) return
        setLoaded(true)
        setupScroll(model)
      },
      onError: () => setWebglOK(false),
    })

    function setupScroll(model) {
      mm = gsap.matchMedia()
      mm.add(
        {
          isDesktop: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduced } = context.conditions
          const callouts = gsap.utils.toArray('.orbit-callout')

          if (reduced) {
            model.rotation.y = 0.6
            canScene.render()
            gsap.set(callouts, { opacity: 1 })
            return
          }

          if (!isDesktop) {
            model.position.x = -0.4
            const tl = gsap.timeline({
              scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', end: 'top 20%', scrub: 0.6 },
            })
            tl.fromTo(model.rotation, { y: 0 }, { y: Math.PI * 1.4, ease: 'none', onUpdate: canScene.render }, 0)
            tl.fromTo(model.position, { x: -0.4 }, { x: 0.4, ease: 'none', onUpdate: canScene.render }, 0)
            gsap.fromTo(
              callouts,
              { opacity: 0, y: 12 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 55%' },
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
              onUpdate: canScene.render,
            },
          })

          // Full 360deg turn plus a left-to-right drift, so it reads as a
          // camera-like pass around the object rather than a spin in place.
          tl.fromTo(model.rotation, { y: 0 }, { y: Math.PI * 2, ease: 'none', duration: 1 }, 0)
          tl.fromTo(model.position, { x: -0.65 }, { x: 0.65, ease: 'none', duration: 1 }, 0)
          tl.fromTo(canScene.key, { intensity: 1.4 }, { intensity: 2.6, ease: 'none', duration: 1 }, 0)

          CALLOUTS.forEach((callout, i) => {
            const el = callouts[i]
            const w = 0.14
            tl.fromTo(el, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: w * 0.4, ease: 'none' }, callout.at - w)
            tl.to(el, { opacity: 0, duration: w * 0.4, ease: 'none' }, callout.at + w * 0.6)
          })
        },
      )
    }

    const onResize = () => canScene.resize()
    window.addEventListener('resize', onResize)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) canScene.render()
    })
    io.observe(sectionRef.current)

    return () => {
      disposed = true
      window.removeEventListener('resize', onResize)
      io.disconnect()
      if (mm) mm.revert()
      canScene.dispose()
    }
  }, [webglOK])

  return (
    <section className="orbit-chapter" ref={sectionRef}>
      <div className="orbit-pin" ref={pinRef}>
        <div className="orbit-bg" />

        {webglOK ? (
          <div className="orbit-canvas" ref={canvasWrapRef} aria-hidden="true" />
        ) : (
          <img className="orbit-fallback" src="/can-cutout.png" alt="2CAL can" />
        )}
        {webglOK && !loaded && <div className="orbit-loading" aria-hidden="true" />}

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
