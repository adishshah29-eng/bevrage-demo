import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, ShoppingBagOpen, CheckCircle } from '@phosphor-icons/react'
import './Shop.css'

gsap.registerPlugin(ScrollTrigger)

const PACKS = [
  { key: 'p4', size: 4, price: 529 },
  { key: 'p8', size: 8, price: 999, popular: true },
  { key: 'p12', size: 12, price: 1129 },
]

const PERKS = ['75mg clean tea caffeine', 'Zero added sugar', 'Ships across India, 2-4 days']

export default function Shop() {
  const sectionRef = useRef(null)
  const [selected, setSelected] = useState('p8')
  const pack = PACKS.find((p) => p.key === selected)
  const perCan = (pack.price / pack.size).toFixed(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.shop-visual', {
        opacity: 0,
        x: -32,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      })
      gsap.from('.shop-panel', {
        opacity: 0,
        x: 32,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="shop" className="shop" ref={sectionRef}>
      <div className="shop-inner">
        <div className="shop-visual">
          <div className="shop-visual-glow" />
          <img src="/can-cutout.png" alt="2CAL peach ice tea can" />
          <div className="shop-visual-rating">
            <Star weight="fill" size={14} />
            <span>4.8</span>
            <span className="shop-visual-count">1,234 reviews</span>
          </div>
        </div>

        <div className="shop-panel">
          <p className="shop-kicker">pick your pack</p>
          <h2>however much focus you need this week.</h2>

          <div className="shop-sizes" role="radiogroup" aria-label="Pack size">
            {PACKS.map((p) => (
              <button
                key={p.key}
                type="button"
                role="radio"
                aria-checked={selected === p.key}
                className={`shop-size${selected === p.key ? ' is-active' : ''}`}
                onClick={() => setSelected(p.key)}
              >
                {p.popular && <span className="shop-size-tag">Best value</span>}
                <span className="shop-size-count">{p.size}</span>
                <span className="shop-size-label">cans</span>
              </button>
            ))}
          </div>

          <div className="shop-price-row">
            <span className="shop-price-amount">₹{pack.price.toLocaleString('en-IN')}</span>
            <span className="shop-price-per">₹{perCan} per can</span>
          </div>

          <ul className="shop-perks">
            {PERKS.map((perk) => (
              <li key={perk}>
                <CheckCircle weight="fill" size={16} />
                {perk}
              </li>
            ))}
          </ul>

          <button className="shop-cta" type="button">
            <ShoppingBagOpen weight="bold" size={18} />
            Add {pack.size}-pack to cart
          </button>
        </div>
      </div>
    </section>
  )
}
