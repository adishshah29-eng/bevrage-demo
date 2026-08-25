import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Quotes } from '@phosphor-icons/react'
import './Reviews.css'

gsap.registerPlugin(ScrollTrigger)

const ROW_ONE = [
  { quote: 'Replaced my 2am coffee with this. Still finished the deck, still slept by 3.', name: 'Ananya Rao', role: 'Freelance designer' },
  { quote: 'Tastes like actual peach tea, not a chemistry set. Didn’t expect that.', name: 'Karan Mehta', role: 'Software engineer' },
  { quote: 'No crash by 4pm anymore. That’s the whole pitch for me.', name: 'Divya Suresh', role: 'Med student' },
]

const ROW_TWO = [
  { quote: 'Been drinking three coffees a day for years. Down to one now.', name: 'Rohan Nair', role: 'Founder' },
  { quote: 'Calm focus, not jittery focus. Big difference during long shifts.', name: 'Fatima Sheikh', role: 'Content writer' },
  { quote: 'Doesn’t sit heavy before a lift. My gym bag staple now.', name: 'Arjun Bhatt', role: 'Trainer' },
]

function Card({ review }) {
  return (
    <article className="review-card">
      <Quotes weight="fill" size={20} className="review-mark" />
      <p>{review.quote}</p>
      <div className="review-attribution">
        <span className="review-name">{review.name}</span>
        <span className="review-role">{review.role}</span>
      </div>
    </article>
  )
}

export default function Reviews() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.reviews-head > *', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="reviews" className="reviews" ref={sectionRef}>
      <div className="reviews-head">
        <p className="reviews-kicker">from the can, not a script</p>
        <h2>what people actually say.</h2>
      </div>

      <div className="reviews-marquee" aria-hidden="true">
        <div className="reviews-row reviews-row-a">
          {[...ROW_ONE, ...ROW_ONE].map((review, i) => (
            <Card review={review} key={`a-${review.name}-${i}`} />
          ))}
        </div>
        <div className="reviews-row reviews-row-b">
          {[...ROW_TWO, ...ROW_TWO].map((review, i) => (
            <Card review={review} key={`b-${review.name}-${i}`} />
          ))}
        </div>
      </div>

      <ul className="reviews-sr-list">
        {[...ROW_ONE, ...ROW_TWO].map((review) => (
          <li key={review.name}>
            {review.quote} — {review.name}, {review.role}
          </li>
        ))}
      </ul>
    </section>
  )
}
