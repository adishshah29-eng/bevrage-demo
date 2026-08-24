import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from '@phosphor-icons/react'
import './HeroScrub.css'

gsap.registerPlugin(ScrollTrigger)

const FRAME_COUNT = 120
const FRAME_PATH = (i) => `/hero-frames/frame_${String(i).padStart(3, '0')}.webp`

const ANNOTATIONS = [
  { label: '75mg clean caffeine' },
  { label: 'lion\'s mane' },
  { label: 'l-theanine' },
]

export default function HeroScrub() {
  const wrapRef = useRef(null)
  const pinRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const fogCoolRef = useRef(null)
  const fogWarmRef = useRef(null)
  const headlineRef = useRef(null)
  const ctaRef = useRef(null)

  const imagesRef = useRef([])
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)

  // Preload the frame sequence
  useEffect(() => {
    let cancelled = false
    let loaded = 0
    const images = new Array(FRAME_COUNT)

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.src = FRAME_PATH(i)
      img.onload = img.onerror = () => {
        if (cancelled) return
        loaded += 1
        setLoadProgress(loaded / FRAME_COUNT)
        if (loaded === FRAME_COUNT) setReady(true)
      }
      images[i - 1] = img
    }

    imagesRef.current = images
    return () => {
      cancelled = true
    }
  }, [])

  // Draw current frame to canvas, cover-fit but biased so the can sits
  // off-center (asymmetric composition) instead of dead-centered.
  const drawFrame = (index) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const isMobile = w <= 780
    const focusX = isMobile ? 0.5 : 0.37

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const canvasRatio = w / h
    const imgRatio = img.naturalWidth / img.naturalHeight
    let dw, dh, dx, dy
    if (imgRatio > canvasRatio) {
      dh = h
      dw = h * imgRatio
      dx = focusX * w - 0.5 * dw
      dy = 0
    } else {
      dw = w
      dh = w / imgRatio
      dx = 0
      dy = (h - dh) / 2
    }
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  useLayoutEffect(() => {
    if (!ready) return

    const ctx = gsap.context(() => {
      drawFrame(0)

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isMobile = window.matchMedia('(max-width: 780px)').matches
      const pinDistance = isMobile ? '+=220%' : '+=340%'

      const frameProxy = { f: 0 }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: pinDistance,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      if (prefersReduced) {
        drawFrame(FRAME_COUNT - 1)
        gsap.set([fogCoolRef.current, fogWarmRef.current], { opacity: 0 })
        gsap.set(canvasRef.current, { filter: 'none' })
        gsap.set([headlineRef.current, ctaRef.current, '.hero-annotation'], {
          opacity: 1,
          x: 0,
          y: 0,
        })
        gsap.set('.hero-annotation-tick', { scaleX: 1 })
        return
      }

      // Frame scrub across the whole pin
      tl.to(
        frameProxy,
        {
          f: FRAME_COUNT - 1,
          ease: 'none',
          onUpdate: () => drawFrame(Math.round(frameProxy.f)),
        },
        0,
      )

      // Fog -> focus, graded in color, not just blur: cold desaturated
      // blue-grey sharpens and warms back into the brand's real palette.
      tl.fromTo(
        canvasRef.current,
        { filter: 'blur(24px) saturate(0.08) brightness(0.62) contrast(1.05)' },
        {
          filter: 'blur(0px) saturate(1) brightness(1) contrast(1)',
          ease: 'none',
          duration: 0.44,
        },
        0,
      )

      // Two atmosphere layers cross-fade: cold fog dissipates, warm glow arrives
      tl.fromTo(fogCoolRef.current, { opacity: 0.85 }, { opacity: 0, ease: 'none', duration: 0.4 }, 0)
      tl.fromTo(fogWarmRef.current, { opacity: 0 }, { opacity: 0.55, ease: 'none', duration: 0.44 }, 0.04)

      // Headline slides in from the right, breaking the dead-center layout
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, x: 36 },
        { opacity: 1, x: 0, duration: 0.16, ease: 'none' },
        0.28,
      )

      // Ingredient annotations draw in one at a time, spec-sheet style
      tl.fromTo(
        '.hero-annotation-tick',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', stagger: 0.1, duration: 0.06 },
        0.46,
      )
      tl.fromTo(
        '.hero-annotation-label',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, ease: 'none', stagger: 0.1, duration: 0.08 },
        0.48,
      )

      // CTA lands last, once every annotation has resolved
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.14, ease: 'none' },
        0.86,
      )
    }, wrapRef)

    return () => ctx.revert()
  }, [ready])

  // Cursor-reactive tilt on the product shot (desktop pointer devices only)
  useEffect(() => {
    const stage = stageRef.current
    const pin = pinRef.current
    if (!stage || !pin) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (reduce || !canHover) return

    const setRotateX = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const setRotateY = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'power3.out' })

    const onMove = (event) => {
      const rect = pin.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      setRotateY(px * 7)
      setRotateX(py * -7)
    }
    const onLeave = () => {
      setRotateX(0)
      setRotateY(0)
    }

    pin.addEventListener('mousemove', onMove)
    pin.addEventListener('mouseleave', onLeave)
    return () => {
      pin.removeEventListener('mousemove', onMove)
      pin.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section className="hero-wrap" ref={wrapRef}>
      <div className="hero-pin" ref={pinRef}>
        <div className="hero-stage" ref={stageRef}>
          <canvas ref={canvasRef} className="hero-canvas" />
        </div>
        <div className="hero-fog hero-fog-cool" ref={fogCoolRef} />
        <div className="hero-fog hero-fog-warm" ref={fogWarmRef} />
        <div className="hero-side-scrim" />
        <div className="hero-vignette" />

        <div className="hero-copy">
          <div className="hero-lockup">
            <h1 className="hero-headline" ref={headlineRef}>
              <span className="script">the drink for</span>
              brainmaxxing
            </h1>

            <div className="hero-annotations">
              {ANNOTATIONS.map((item) => (
                <div className="hero-annotation" key={item.label}>
                  <span className="hero-annotation-tick" />
                  <span className="hero-annotation-label">{item.label}</span>
                </div>
              ))}
            </div>

            <a className="hero-button" href="#shop" ref={ctaRef}>
              Shop 2CAL
              <ArrowRight weight="bold" size={16} />
            </a>
          </div>
        </div>

        {!ready && (
          <div className="hero-loader">
            <div className="hero-loader-bar">
              <div
                className="hero-loader-fill"
                style={{ transform: `scaleX(${loadProgress})` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
