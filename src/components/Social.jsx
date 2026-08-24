import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { InstagramLogo, ArrowUpRight } from '@phosphor-icons/react'
import './Social.css'

gsap.registerPlugin(ScrollTrigger)

const POSTS = [
  { image: '/section-stills/still_010.webp', caption: 'the drink for brainmaxxing' },
  { image: '/section-stills/still_020.webp', caption: 'you didn’t lose focus. your phone stole it.' },
  { image: '/section-stills/still_035.webp', caption: 'no one’s talking about the main issue: brain fog.' },
  { image: '/section-stills/still_075.webp', caption: 'peach ice tea, built for the 2pm crash.' },
]

export default function Social() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.social-tile', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
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
    <section id="social" className="social" ref={sectionRef}>
      <div className="social-head">
        <h2>find us on instagram.</h2>
        <a
          className="social-follow"
          href="https://instagram.com/drink2cal"
          target="_blank"
          rel="noreferrer"
        >
          <InstagramLogo weight="regular" size={18} />
          @drink2cal
          <ArrowUpRight weight="bold" size={14} />
        </a>
      </div>

      <div className="social-grid">
        {POSTS.map((post) => (
          <a
            key={post.caption}
            className="social-tile"
            href="https://instagram.com/drink2cal"
            target="_blank"
            rel="noreferrer"
          >
            <img src={post.image} alt={post.caption} loading="lazy" />
            <div className="social-tile-scrim" />
            <p>{post.caption}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
