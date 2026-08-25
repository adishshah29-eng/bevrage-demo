import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createCanScene, supportsWebGL } from './canScene.js'
import './ChapterFog.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 1 — "The Fog". Atmospheric Sublime pattern, now built around the
// real 3D can (canScene.js) instead of a flat still: the can flies in from
// off-screen left while tumbling through several rotations, arriving
// centered as the fog clears (0 -> 0.55 of the pin). Once it has settled,
// the title reveals (0.6 -> 1.0) — the whole chapter stays pinned for its
// entire scroll range on desktop, so the info reveal never runs unpinned.
// Depth layers at 0.05 / 0.2 / 0.5 / 0.85, distinct from every other
// chapter's set.
export default function ChapterFog() {
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
        setupAnimation(model)
      },
      onError: () => setWebglOK(false),
    })

    function setupAnimation(model) {
      mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          isMobile: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, isMobile, reduced } = context.conditions

          if (reduced) {
            model.position.x = 0
            model.rotation.y = 0.4
            canScene.render()
            gsap.set('.fog-haze', { opacity: 0.15 })
            gsap.set('.fog-copy', { opacity: 1, clipPath: 'inset(0 0 0% 0)' })
            return
          }

          if (isMobile) {
            model.position.x = -1.3
            model.rotation.y = -Math.PI * 1.2
            gsap.set('.fog-haze', { opacity: 0.55 })
            const tl = gsap.timeline({
              scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
            })
            tl.to('.fog-haze', { opacity: 0.15, duration: 0.6, ease: 'power2.out' }, 0)
            tl.to(
              model.position,
              { x: 0, duration: 0.6, ease: 'power2.out', onUpdate: canScene.render },
              0.1,
            )
            tl.to(
              model.rotation,
              { y: 0, duration: 0.6, ease: 'power2.out', onUpdate: canScene.render },
              0.1,
            )
            tl.fromTo('.fog-copy', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.25)
            return
          }

          if (!isDesktop) return

          model.position.x = -2.3
          model.rotation.y = -Math.PI * 1.8
          canScene.render()

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=300%',
              scrub: 0.6,
              pin: pinRef.current,
              anticipatePin: 1,
              onUpdate: canScene.render,
            },
          })

          // 0 -> 0.55: the can tumbles in from the left, fog thins as it
          // arrives. Position and rotation share the same window so the
          // "coming from left while rotating" motion reads as one arrival.
          tl.fromTo(model.position, { x: -2.3 }, { x: 0, ease: 'power2.out', duration: 0.55 }, 0)
          tl.fromTo(model.rotation, { y: -Math.PI * 1.8 }, { y: 0, ease: 'power2.out', duration: 0.55 }, 0)
          tl.fromTo(canScene.key, { intensity: 1.4 }, { intensity: 2.8, ease: 'none', duration: 0.55 }, 0)
          tl.fromTo('.fog-haze', { opacity: 0.85 }, { opacity: 0.1, ease: 'none', duration: 0.5 }, 0)
          tl.fromTo('.fog-dust', { opacity: 0 }, { opacity: 0.5, ease: 'power2.out', duration: 0.3 }, 0.3)

          // 0.6 -> 1.0: the can has settled — this is the info beat, and the
          // section is pinned for its whole range, so it holds through this
          // reveal rather than continuing to scroll past.
          tl.fromTo(
            '.fog-copy',
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', ease: 'power2.out', duration: 0.35 },
            0.62,
          )
          tl.fromTo('.fog-copy', { opacity: 0 }, { opacity: 1, ease: 'power2.out', duration: 0.35 }, 0.62)
        },
      )
    }

    const onResize = () => canScene.resize()
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      window.removeEventListener('resize', onResize)
      if (mm) mm.revert()
      canScene.dispose()
    }
  }, [webglOK])

  return (
    <section className="fog-chapter" ref={sectionRef}>
      <div className="fog-pin" ref={pinRef}>
        <div className="fog-stage">
          <div className="fog-bg" />
          <div className="fog-haze" />
          <div className="fog-dust" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ '--i': i }} />
            ))}
          </div>

          {webglOK ? (
            <div className="fog-canvas" ref={canvasWrapRef} aria-hidden="true" />
          ) : (
            <img className="fog-fallback" src="/section-stills/still_010.webp" alt="2CAL can emerging from fog" />
          )}
          {webglOK && !loaded && <div className="fog-loading" aria-hidden="true" />}
        </div>

        <div className="fog-copy">
          <p className="fog-eyebrow">chapter one &middot; the fog</p>
          <h2 className="fog-title">somewhere between focus and fog, something shifts.</h2>
        </div>
      </div>
    </section>
  )
}
