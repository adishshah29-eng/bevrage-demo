import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// Shared Three.js setup for the can model, used by both ChapterFog (fly-in
// entrance) and ChapterOrbit (orbit-in-place) so the WebGL boilerplate
// (feature detection, lighting/environment, GLTF load + material tint,
// disposal) lives in one place instead of being duplicated per chapter.
const MODEL_URL = '/models/can/scene.gltf'

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function createCanScene(container, { onLoad, onError } = {}) {
  let disposed = false
  let model = null

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 0.15, 4.2)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  const onContextLost = (e) => e.preventDefault()
  const onContextRestored = () => {
    if (!disposed) load()
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false)

  // Cheap image-based lighting (a procedural room, not an HDRI file) so the
  // metallic material has something to reflect instead of reading black.
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()

  // Light budget: 3 lights — hemisphere fill + warm key + cool rim.
  scene.add(new THREE.HemisphereLight(0xfff2df, 0x2a2016, 1.3))
  const key = new THREE.DirectionalLight(0xffb066, 2.8)
  key.position.set(2.5, 3, 2)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x8fa8c0, 1.4)
  rim.position.set(-3, 1, -2)
  scene.add(rim)

  function render() {
    if (!disposed) renderer.render(scene, camera)
  }

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1 : 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h)
    render()
  }

  // A single resize() call right after load can race the container's real
  // layout (observed on mobile: the renderer was left at Three's 300x150
  // default, then stretched via CSS, reading as a giant blocky can).
  // ResizeObserver keeps the drawing buffer honest across that race and any
  // later layout change (orientation, font swap, etc).
  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(container)

  function load() {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return
        try {
          model = gltf.scene

          model.traverse((node) => {
            if (node.isMesh && node.material) {
              const mat = node.material
              // Decal is a generic soda-can decal, not 2CAL's own label art,
              // and there's no way to map our real label onto this mesh's
              // UV layout without the source file. Drop the texture rather
              // than tint it — multiplying a color over an unknown,
              // strongly-colored source doesn't reliably neutralize its hue.
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

          // Camera is 32deg vertical FOV at z=4.2, so the frustum is only
          // ~2.4 world units tall at the origin. Fit the can to ~1.7 (not
          // the old 2.6, which overflowed the frame and read as a wall of
          // texture instead of a recognizable can) so there's headroom
          // above/below at every point in its travel.
          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          const scale = 1.7 / Math.max(size.x, size.y, size.z)
          model.scale.setScalar(scale)
          model.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

          scene.add(model)
          resize()
          onLoad?.(model)
        } catch (err) {
          onError?.(err)
        }
      },
      undefined,
      (err) => onError?.(err),
    )
  }

  load()

  function dispose() {
    disposed = true
    resizeObserver.disconnect()
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
    renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored)
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
    scene.environment?.dispose()
    renderer.dispose()
  }

  return { scene, camera, renderer, key, render, resize, dispose }
}
