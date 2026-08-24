import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star, ShoppingBagOpen } from '@phosphor-icons/react'
import './Shop.css'

gsap.registerPlugin(ScrollTrigger)

const PACKS = [
  { key: 'p4', size: 4, price: 529, rating: 4.8, reviews: 348 },
  { key: 'p8', size: 8, price: 999, rating: 4.8, reviews: 512, popular: true },
  { key: 'p12', size: 12, price: 1129, rating: 4.9, reviews: 374 },
]

export default function Shop() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.shop-card', {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
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
    <section id="shop" className="shop" ref={sectionRef}>
      <div className="shop-head">
        <h2>pick your pack.</h2>
        <p>Peach ice tea, 75mg clean tea caffeine, zero added sugar. Ships across India.</p>
      </div>

      <div className="shop-grid">
        {PACKS.map((pack) => {
          const perCan = (pack.price / pack.size).toFixed(0)
          return (
            <article key={pack.key} className={`shop-card${pack.popular ? ' is-popular' : ''}`}>
              {pack.popular && <span className="shop-badge">Most popular</span>}
              <div className="shop-card-top">
                <h3>Pack of {pack.size}</h3>
                <span className="shop-sub">Tea-based energy drink</span>
              </div>

              <div className="shop-price">
                <span className="shop-price-amount">₹{pack.price.toLocaleString('en-IN')}</span>
                <span className="shop-price-per">₹{perCan} / can</span>
              </div>

              <div className="shop-rating">
                <Star weight="fill" size={15} />
                <span>{pack.rating}</span>
                <span className="shop-reviews">({pack.reviews} reviews)</span>
              </div>

              <button className="shop-cta" type="button">
                <ShoppingBagOpen weight="bold" size={17} />
                Add to cart
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
