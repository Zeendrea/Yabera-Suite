import { useState } from 'react'
import { GALLERY } from '../content'

export default function Gallery() {
  const [active, setActive] = useState(GALLERY[0])

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-4 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Look around</p>
      <h2 className="mt-2 font-display text-4xl text-ink-900">Gallery</h2>
      <div className="mt-8 overflow-hidden rounded-[2rem] shadow-card">
        <img src={active.src} alt={active.alt} className="h-[52vw] max-h-[540px] w-full object-cover" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {GALLERY.map((image) => (
          <button
            key={image.label}
            onClick={() => setActive(image)}
            className={`overflow-hidden rounded-2xl ${active.label === image.label ? 'ring-2 ring-ink-900' : ''}`}
          >
            <img src={image.src} alt={image.alt} className="h-20 w-full object-cover sm:h-24" />
            <span className="block bg-white px-2 py-1 text-center text-xs text-ink-700">{image.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
