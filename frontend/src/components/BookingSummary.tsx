import { computePrice, formatLong } from '../dates'

interface Props {
  step: 1 | 2
  guests: number
  checkIn: string | null
  checkOut: string | null
  nights: number
  submitting?: boolean
  onContinue: () => void
  onSubmit: () => void
  continueDisabled?: boolean
}

function fmt(n: number) {
  return '₱' + n.toLocaleString('en-PH')
}

export default function BookingSummary({
  step, guests, checkIn, checkOut, nights,
  submitting, onContinue, onSubmit, continueDisabled,
}: Props) {
  const hasRange = checkIn && checkOut && nights > 0
  const price    = hasRange ? computePrice(checkIn!, checkOut!, guests) : null

  return (
    <aside className="sticky top-24 rounded-[2rem] bg-white p-6 shadow-card">
      <h3 className="font-display text-2xl text-ink-900">Booking Summary</h3>

      {/* ── Dates & guests ── */}
      <div className="mt-5 space-y-3 text-sm">
        <Row label="Check-in"  value={checkIn  ? formatLong(checkIn)  : '—'} />
        <Row label="Check-out" value={checkOut ? formatLong(checkOut) : '—'} />
        <Row label="Nights"    value={nights > 0 ? String(nights) : '—'} />
        <Row label="Guests"    value={String(guests)} />
      </div>

      {/* ── Pricing ── */}
      {price && (
        <div className="mt-5 border-t border-sand-100 pt-5">
          {/* Discount badge */}
          {price.discountApplied && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Extended Stay Discount Applied · Save {fmt(price.savedAmount)}
            </div>
          )}

          {/* Line items */}
          <div className="space-y-2 text-sm">
            {price.lines.map((line) => (
              <div key={line.label} className="flex items-start justify-between gap-3">
                <span className="text-ink-700">{line.label}</span>
                <span className="shrink-0 font-medium text-ink-900">{fmt(line.amount)}</span>
              </div>
            ))}
          </div>

          {/* Subtotals when extra guest fee exists */}
          {price.extraGuests > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-dashed border-sand-200 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-600">Room subtotal</span>
                <span className="font-medium text-ink-900">{fmt(price.roomTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-amber-700">
                <span>Extra guest fee</span>
                <span className="font-medium">{fmt(price.extraGuestTotal)}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4">
            <span className="font-semibold text-ink-900">Estimated Total</span>
            <span className="font-display text-2xl text-ink-900">{fmt(price.total)}</span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-sand-500">
            Rates may vary during holidays, Sinulog Festival, and peak dates.
          </p>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="mt-6">
        {step === 1 ? (
          <button
            onClick={onContinue}
            disabled={continueDisabled || !hasRange}
            className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Guest Details
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending request…' : 'Submit Booking Request'}
          </button>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-700">
        This is a request only. Your stay is confirmed after the host approves it.
      </p>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sand-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  )
}
