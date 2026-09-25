import {
  AirVent,
  Bath,
  BedDouble,
  CookingPot,
  Microwave,
  Refrigerator,
  Tv,
  Waves,
  Wifi,
  Ban,
} from 'lucide-react'

const amenities = [
  { icon: AirVent, label: 'Air conditioning' },
  { icon: Wifi, label: 'Free high-speed Wi-Fi' },
  { icon: Tv, label: 'Smart TV with Netflix' },
  { icon: BedDouble, label: 'Queen bed' },
  { icon: CookingPot, label: 'Kitchen & basic cookware' },
  { icon: Refrigerator, label: 'Refrigerator' },
  { icon: Microwave, label: 'Microwave' },
  { icon: Bath, label: 'Private bathroom, cold shower' },
  { icon: Waves, label: 'Swimming pool · 6 AM–10 PM' },
  { icon: Ban, label: 'No parking' },
]

export default function Amenities() {
  return (
    <section id="amenities" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Comforts</p>
        <h2 className="mt-2 font-display text-4xl text-ink-900">Amenities</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {amenities.map((item) => (
            <article key={item.label} className="rounded-3xl border border-sand-100 bg-sand-50 p-5">
              <item.icon className="text-ink-800" size={22} />
              <p className="mt-3 text-sm font-medium text-ink-800">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
