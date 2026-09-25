import { Link } from 'react-router-dom'

export default function FinalCta() {
  return (
    <section className="px-4 pb-28 pt-8 md:pb-20">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-ink-900 px-8 py-16 text-center text-white shadow-card">
        <h2 className="font-display text-4xl">Ready to stay in Cebu IT Park?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sand-100">
          Check open dates, send a request, and we’ll confirm your stay after review.
        </p>
        <Link
          to="/book"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-ink-900"
        >
          Check Availability
        </Link>
      </div>
    </section>
  )
}
