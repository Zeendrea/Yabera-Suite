const nearby = [
  { title: 'Ayala Central Bloc Mall', detail: 'Malls, groceries, and everyday shopping within walking distance.' },
  { title: 'Restaurants', detail: 'Plenty of lunch and dinner spots around IT Park.' },
  { title: 'Cafés', detail: 'Coffee shops for a slow morning or a laptop session.' },
  { title: 'Convenience stores', detail: 'Late-night snacks and essentials nearby.' },
  { title: 'BPO offices', detail: 'A practical stay if you work in Cebu IT Park.' },
]

export default function Nearby() {
  return (
    <section id="nearby" className="mx-auto max-w-6xl px-4 pb-8">
      <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Around the tower</p>
      <h2 className="mt-2 font-display text-4xl text-ink-900">Nearby locations</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {nearby.map((place) => (
          <article key={place.title} className="rounded-3xl bg-white p-5 shadow-card">
            <h3 className="font-display text-xl text-ink-900">{place.title}</h3>
            <p className="mt-2 text-sm text-ink-700">{place.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
