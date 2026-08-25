import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ChapterOrbit.css'

gsap.registerPlugin(ScrollTrigger)

// Chapter 3 — "The Object". Real 3D Product Orbit (Tier B: Three.js + GLTF,
// not a CSS illusion) — a real mesh, so the can genuinely turns a full
// 360deg rather than the ~28deg an earlier flat-image version was capped
// to. Model: "Low Poly Soda Can" by Myers2860 (Sketchfab, CC-BY-4.0),
// retextured/tinted toward the brand palette — see LICENSE in
// /public/models/can. Rotation is driven purely by the GSAP scroll
// timeline (render-on-demand in the scrub callback), so there is no free-
// running rAF loop to gate/battery-drain.
const MODEL_URL = '/models/can/scene.gltf'

const CALLOUTS = [
  { at: 0.18, label: '75mg caffeine', style: { left: '8%', top: '28%' } },
  { at: 0.5, label: 'zero added sugar', style: { right: '8%', top: '24%' } },
  { at: 0.82, label: 'peach ice tea', style: { left: '10%', bottom: '22%' } },
]

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

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

    let renderer, scene, camera, model, mm, key
    let disposed = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onContextLost = (e) => {
      e.preventDefault()
    }
    const onContextRestored = () => {
      if (!disposed) init()
    }

    function sizeRenderer() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 1.5)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h)
      render()
    }

    function render() {
      if (renderer && scene && camera) renderer.render(scene, camera)
    }

    function init() {
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      camera.position.set(0, 0.15, 4.2)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      container.innerHTML = ''
      container.appendChild(renderer.domElement)
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false)

      // Cheap image-based lighting (a procedural room, not an HDRI file) —
      // without it, the metallic material has nothing to reflect and reads
      // as flat black except for direct specular hits.
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      pmrem.dispose()

      // Light budget: 3 lights total — hemisphere fill (cheap, no shadow
      // cost) + one warm key light + one cool rim light for edge separation.
      scene.add(new THREE.HemisphereLight(0xfff2df, 0x2a2016, 1.3))
      key = new THREE.DirectionalLight(0xffb066, 2.8)
      key.position.set(2.5, 3, 2)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0x8fa8c0, 1.4)
      rim.position.set(-3, 1, -2)
      scene.add(rim)

      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => {
          try {
            if (disposed) return
            model = gltf.scene

            model.traverse((node) => {
              if (node.isMesh && node.material) {
                const mat = node.material
                // Tint toward the brand palette (a color multiply is safe
                // without knowing this mesh's UV layout, unlike swapping the
                // label texture outright, which risks a stretched/broken map).
                // Decal is a printed label, not metal — force low metalness
                // so it reads from the lights/environment instead of going
                // black waiting for a reflection it has no reason to have.
                // Drop the source label texture (a generic soda decal, not
                // ours) rather than tinting it — multiplying a color over an
                // unknown, strongly-colored texture doesn't reliably
                // neutralize its hue, and a flat brand color is predictable.
                if (mat.name === 'Decal_001') {
                  mat.map = null
                  mat.color = new THREE.Color(0x1b140d)
                  mat.metalness = 0.1
                  mat.roughness = Math.max(mat.roughness, 0.55)
                  mat.needsUpdate = true
                }
                if (mat.name === 'Metal') {
                  mat.color = new THREE.Color(0xf2790f).lerp(new THREE.Color(0xffffff), 0.55)
                  mat.metalness = 0.85
                }
                mat.envMapIntensity = 1
              }
            })

            const box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3())
            const center = box.getCenter(new THREE.Vector3())
            const scale = 2.6 / Math.max(size.x, size.y, size.z)
            model.scale.setScalar(scale)
            model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

            scene.add(model)
            setLoaded(true)
            sizeRenderer()
            setupScroll()
          } catch (err) {
            console.error('[ChapterOrbit] setup after load failed', err)
            setWebglOK(false)
          }
        },
        undefined,
        (err) => {
          console.error('[ChapterOrbit] GLTF load failed', err)
          setWebglOK(false)
        },
      )
    }

    function setupScroll() {
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
            render()
            gsap.set(callouts, { opacity: 1 })
            return
          }

          if (!isDesktop) {
            gsap.fromTo(
              model.rotation,
              { y: 0 },
              {
                y: Math.PI * 1.4,
                ease: 'power2.out',
                onUpdate: render,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', end: 'top 20%', scrub: 0.6 },
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
              onUpdate: render,
            },
          })

          // Full 360deg turn — a real mesh, unlike the flat-image version.
          tl.fromTo(model.rotation, { y: 0 }, { y: Math.PI * 2, ease: 'none', duration: 1 }, 0)
          tl.fromTo(key, { intensity: 1.4 }, { intensity: 2.6, ease: 'none', duration: 1 }, 0)

          CALLOUTS.forEach((callout, i) => {
            const el = callouts[i]
            const w = 0.14
            tl.fromTo(el, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: w * 0.4, ease: 'none' }, callout.at - w)
            tl.to(el, { opacity: 0, duration: w * 0.4, ease: 'none' }, callout.at + w * 0.6)
          })
        },
      )
    }

    init()
    window.addEventListener('resize', sizeRenderer)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) render()
    })
    io.observe(sectionRef.current)

    return () => {
      disposed = true
      window.removeEventListener('resize', sizeRenderer)
      io.disconnect()
      if (mm) mm.revert()
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
      }
      if (model) {
        model.traverse((node) => {
          if (node.isMesh) {
            node.geometry?.dispose()
            const mats = Array.isArray(node.material) ? node.material : [node.material]
            mats.forEach((mat) => {
              Object.values(mat).forEach((v) => v?.isTexture && v.dispose())
              mat.dispose()
            })
          }
        })
      }
      scene?.environment?.dispose()
      renderer?.dispose()
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
