import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Leaf, Wind } from '@phosphor-icons/react'
import './Stack.css'

gsap.registerPlugin(ScrollTrigger)

const INGREDIENTS = [
  {
    key: 'lionsmane',
    icon: Brain,
    name: 'Lion\'s Mane',
    role: 'Brain boosting',
    body: 'Supports memory, focus, and mental clarity by promoting nerve growth factor and long-term brain health.',
    image: '/section-stills/still_010.webp',
    featured: true,
  },
  {
    key: 'ltheanine',
    icon: Wind,
    name: 'L-Theanine',
    role: 'Smooth focus',
    body: 'Works with caffeine to promote calm alertness, cutting the jitters without cutting the lift.',
    image: '/section-stills/still_055.webp',
  },
  {
    key: 'monkfruit',
    icon: Leaf,
    name: 'Monk Fruit',
    role: 'Natural sweetener',
    body: 'Zero-calorie, natural antioxidants, clean sweetness with no crash on the other side.',
    image: '/section-stills/still_095.webp',
  },
]

export default function Stack() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.stack-card', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="stack" className="stack" ref={sectionRef}>
      <div className="stack-head">
        <h2>
          your coffee habit is <em>ruining</em> your focus.
        </h2>
        <p>2CAL is built on three ingredients that actually earn their place in the can.</p>
      </div>

      <div className="stack-grid">
        {INGREDIENTS.map(({ key, icon: Icon, name, role, body, image, featured }) => (
          <article key={key} className={`stack-card${featured ? ' is-featured' : ''}`}>
            <div className="stack-card-bg" style={{ backgroundImage: `url(${image})` }} />
            <div className="stack-card-scrim" />
            <div className="stack-card-content">
              <span className="stack-icon">
                <Icon weight="light" size={featured ? 34 : 26} />
              </span>
              <div>
                <h3>{name}</h3>
                <span className="stack-role">{role}</span>
              </div>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
