import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import './Faq.css'

const FAQS = [
  {
    q: 'Can I drink it every day?',
    a: 'Yes. One can has 75mg of clean tea caffeine, less than a standard cup of coffee, balanced with l-theanine so it is built for daily use without the jitters or the crash.',
  },
  {
    q: 'How does it taste?',
    a: 'Real peach iced tea, not carbonated. Sweetened with monk fruit, so there is no artificial aftertaste and zero added sugar.',
  },
  {
    q: 'How much caffeine is in one can?',
    a: '75mg, sourced from tea extract instead of coffee beans. That is roughly what you would get from a small cup of coffee.',
  },
  {
    q: 'Will it keep me up at night?',
    a: 'Treat it like any caffeinated drink and avoid it right before bed. The l-theanine mellows the effect, but caffeine sensitivity varies from person to person.',
  },
  {
    q: 'Any side effects I should know about?',
    a: 'It is formulated with clean ingredients and no added sugar. If you are sensitive to caffeine, pregnant, or managing a medical condition, check with your doctor first.',
  },
  {
    q: 'Where can I buy it?',
    a: 'Right here. Pick a pack in the shop section above. We ship across India.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="faq">
      <div className="faq-inner">
        <div className="faq-intro">
          <p className="faq-kicker">before you order</p>
          <h2>questions, answered.</h2>
          <p className="faq-sub">Everything people ask us before their first can. Still curious? Reach out any time.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="faq-question-text">{item.q}</span>
                  <Plus weight="bold" size={16} className="faq-icon" />
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
