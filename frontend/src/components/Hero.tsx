import { Link } from 'react-router-dom'
import { HERO_IMAGE, PROPERTY } from '../content'

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden">
      <img
        src={HERO_IMAGE}
        alt="Yabera Suite studio bedroom"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/35 to-ink-900/20" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 text-white">
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-sand-100">Cebu IT Park stay</p>
        <h1 className="max-w-2xl font-display text-5xl leading-tight sm:text-6xl">{PROPERTY.name}</h1>
        <p className="mt-4 max-w-xl text-lg text-sand-50/90">{PROPERTY.tagline}</p>
        <p className="mt-2 max-w-xl text-sand-100/80">
          Comfortable, convenient, and close to work, cafés, and Ayala Central Bloc.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/book"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900"
          >
            Book Your Stay
          </Link>
          <a
            href="#about"
            className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white"
          >
            View Details
          </a>
        </div>
      </div>
    </section>
  )
}
