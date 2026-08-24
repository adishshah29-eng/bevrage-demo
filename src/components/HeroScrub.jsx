import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from '@phosphor-icons/react'
import './HeroScrub.css'

gsap.registerPlugin(ScrollTrigger)

const FRAME_COUNT = 120
const FRAME_PATH = (i) => `/hero-frames/frame_${String(i).padStart(3, '0')}.webp`

export default function HeroScrub() {
  const wrapRef = useRef(null)
  const pinRef = useRef(null)
  const canvasRef = useRef(null)
  const fogRef = useRef(null)
  const logoRef = useRef(null)
  const taglineRef = useRef(null)
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

  // Draw current frame to canvas, sized to cover the viewport
  const drawFrame = (index) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth
    const h = canvas.clientHeight

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
      dx = (w - dw) / 2
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
        gsap.set(fogRef.current, { opacity: 0 })
        gsap.set([logoRef.current, taglineRef.current, ctaRef.current], { opacity: 1, y: 0 })
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

      // Fog -> focus: the canvas itself sharpens and de-saturates back to color
      tl.fromTo(
        canvasRef.current,
        { filter: 'blur(22px) saturate(0.35) brightness(0.75)' },
        { filter: 'blur(0px) saturate(1) brightness(1)', ease: 'none', duration: 0.42 },
        0,
      )

      // Atmospheric overlay dissipates alongside it
      tl.fromTo(fogRef.current, { opacity: 0.9 }, { opacity: 0, ease: 'none', duration: 0.42 }, 0)

      // Logo mark arrives early, once the fog has mostly cleared
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.12, ease: 'none' },
        0.28,
      )

      // Tagline holds through the mid-scroll
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.14, ease: 'none' },
        0.46,
      )
      tl.to(taglineRef.current, { opacity: 0, y: -14, duration: 0.1, ease: 'none' }, 0.78)

      // CTA + ingredient chips land at the end, over the sharp final frame
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.16, ease: 'none' },
        0.82,
      )
    }, wrapRef)

    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section className="hero-wrap" ref={wrapRef}>
      <div className="hero-pin" ref={pinRef}>
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-fog" ref={fogRef} />
        <div className="hero-vignette" />

        <div className="hero-copy">
          <div className="hero-logo" ref={logoRef}>
            2CAL
          </div>
          <div className="hero-bottom">
            <div className="hero-tagline" ref={taglineRef}>
              <span className="script">the drink for</span>
              <br />
              brainmaxxing
            </div>
            <div className="hero-cta" ref={ctaRef}>
              <div className="hero-chips">
                <span>caffeine</span>
                <span>lionsmane</span>
                <span>l-theanine</span>
              </div>
              <a className="hero-button" href="#shop">
                Shop 2CAL
                <ArrowRight weight="bold" size={16} />
              </a>
            </div>
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
