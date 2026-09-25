import { useState } from 'react'
import { PROPERTY } from '../content'

const faqs = [
  { q: 'How many guests can stay?', a: 'The studio comfortably hosts 2 guests and can accommodate up to 4.' },
  { q: 'Is Wi-Fi available?', a: 'Yes. Free high-speed Wi-Fi is included for your stay.' },
  { q: 'Is there a swimming pool?', a: `Yes. Building pool hours are ${PROPERTY.poolHours}.` },
  {
    q: 'What time is check-in/check-out?',
    a: `Check-in is ${PROPERTY.checkIn}. Check-out is ${PROPERTY.checkOut}. Exact timing is confirmed by the host after your request.`,
  },
  { q: 'Is parking available?', a: 'No parking is provided with this unit.' },
  { q: 'Is the unit air-conditioned?', a: 'Yes. The studio has air conditioning.' },
  { q: 'Is Netflix available?', a: 'Yes. There is a smart TV with Netflix.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Helpful details</p>
      <h2 className="mt-2 font-display text-4xl text-ink-900">FAQ</h2>
      <div className="mt-8 divide-y divide-sand-200 rounded-[2rem] bg-white shadow-card">
        {faqs.map((item, index) => (
          <button
            key={item.q}
            className="w-full px-6 py-5 text-left"
            onClick={() => setOpen(open === index ? null : index)}
          >
            <p className="font-semibold text-ink-900">{item.q}</p>
            {open === index && <p className="mt-2 text-ink-700">{item.a}</p>}
          </button>
        ))}
      </div>
    </section>
  )
}
