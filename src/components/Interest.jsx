import './Interest.css'

const CARDS = [
  {
    frame: '/hero-frames/frame_045.webp',
    eyebrow: 'the issue',
    title: 'you didn’t lose focus.',
    body: 'your phone stole it. 2+ hours before the crash hits.',
  },
  {
    frame: '/hero-frames/frame_090.webp',
    eyebrow: 'the fix',
    title: 'clean stimulation.',
    body: 'caffeine + lionsmane + l-theanine — zero added sugar, zero crash.',
  },
  {
    frame: '/hero-frames/frame_120.webp',
    eyebrow: 'the drink',
    title: 'peach ice tea, 2 cal.',
    body: 'monkfruit, tea extract, real peach juice.',
  },
]

export default function Interest() {
  return (
    <section id="interest" className="interest">
      <div className="interest-head">
        <h2>
          your coffee habit is <span className="script">ruining</span> your focus.
        </h2>
        <p>2CAL is built to fix what caffeine alone can’t.</p>
      </div>

      <div className="interest-grid">
        {CARDS.map((card) => (
          <article key={card.title} className="interest-card">
            <div className="interest-card-image" style={{ backgroundImage: `url(${card.frame})` }} />
            <div className="interest-card-copy">
              <span className="eyebrow">{card.eyebrow}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
