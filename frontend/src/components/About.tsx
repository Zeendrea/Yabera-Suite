import { MapPin, Users, Home } from 'lucide-react'
import { PROPERTY } from '../content'

const facts = [
  { icon: MapPin, label: 'Location', value: PROPERTY.address },
  { icon: Users, label: 'Capacity', value: PROPERTY.capacity },
  { icon: Home, label: 'Layout', value: PROPERTY.unitType },
]

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-sand-500">The suite</p>
      <h2 className="mt-2 font-display text-4xl text-ink-900">A cozy studio made for easy city stays</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-700">
        Yabera Suite is a welcoming studio inside Avida Towers Riala Tower 5. Rest after work, cook a simple meal,
        stream a show, then walk to IT Park’s cafés and offices—without needing a car.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {facts.map((fact) => (
          <article key={fact.label} className="rounded-3xl bg-white p-6 shadow-card">
            <fact.icon className="text-sand-500" size={22} />
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-sand-500">{fact.label}</h3>
            <p className="mt-2 text-ink-800">{fact.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
