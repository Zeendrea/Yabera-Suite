import { PROPERTY } from '../content'

const nearby = [
  { title: 'Ayala Central Bloc Mall', detail: 'Shopping, dining, and everyday errands a short walk away.' },
  { title: 'Restaurants', detail: 'Casual and sit-down options throughout IT Park.' },
  { title: 'Cafés', detail: 'Coffee shops for remote work or a slow morning.' },
  { title: 'Convenience stores', detail: 'Late-night snacks and essentials nearby.' },
  { title: 'BPO offices', detail: 'A practical home base for IT Park professionals.' },
]

export default function Location() {
  return (
    <section id="location" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Neighborhood</p>
        <h2 className="mt-2 font-display text-4xl text-ink-900">In Cebu IT Park</h2>
        <p className="mt-4 max-w-2xl text-ink-700">{PROPERTY.address}</p>
        <div className="mt-8 overflow-hidden rounded-[2rem] shadow-card">
          <iframe
            title="Yabera Suite location"
            src={PROPERTY.mapEmbed}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearby.map((place) => (
            <article key={place.title} className="rounded-3xl border border-sand-100 bg-sand-50 p-6">
              <h3 className="font-display text-xl text-ink-900">{place.title}</h3>
              <p className="mt-2 text-ink-700">{place.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
