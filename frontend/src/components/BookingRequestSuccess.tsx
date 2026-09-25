import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatLong } from '../dates'
import type { Booking } from '../types'
import StatusBadge from './StatusBadge'

// ── Inline icons ─────────────────────────────────────────────────────────────
function Icon({ d, size = 20, strokeWidth = 1.75 }: { d: string; size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

// ── "What's next" step ────────────────────────────────────────────────────────
function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2EBE1] font-serif text-sm font-semibold text-[#B88A6A]">
        {n}
      </div>
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-700">{body}</p>
      </div>
    </div>
  )
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-ink-600">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink-900">
        {children ?? value}
      </dd>
    </div>
  )
}

function formatPeso(amount: number | null) {
  return amount == null ? '—' : `₱${amount.toLocaleString('en-US')}`
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BookingRequestSuccess({ booking }: { booking: Booking }) {
  const [copied, setCopied] = useState(false)

  function copyRef() {
    navigator.clipboard.writeText(booking.bookingReference).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">

      {/* ── Success header ── */}
      <div className="flex flex-col items-center text-center">
        {/* Checkmark badge */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          {/* Outer ring */}
          <span className="absolute inset-0 rounded-full bg-[#E8F5E9] opacity-60" />
          {/* Inner circle */}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#C8E6C9] text-[#2E7D32]">
            <Icon d="M20 6L9 17l-5-5" size={26} strokeWidth={2.5} />
          </span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88A6A]">
          Request received
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink-900">
          Booking Request Submitted!
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-700">
          Thank you for your request. Your booking is currently awaiting payment and is not confirmed yet.
          Please check your email for the payment instructions and QR code.
        </p>
      </div>

      {/* ── Summary card ── */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">

        {/* Card header */}
        <div className="border-b border-sand-100 bg-[#FDFBF7] px-6 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#B88A6A]">
            Booking Summary
          </p>
        </div>

        {/* Reference row — highlighted */}
        <div className="flex items-center justify-between border-b border-sand-100 bg-[#F9F5EF] px-6 py-4">
          <div>
            <p className="text-xs text-ink-600">Booking Reference</p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-ink-900">
              {booking.bookingReference}
            </p>
          </div>
          <button
            onClick={copyRef}
            className="flex items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition-all hover:border-ink-900 hover:text-ink-900"
          >
            {copied
              ? <><Icon d="M20 6L9 17l-5-5" size={13} strokeWidth={2.5} /> Copied!</>
              : <><Icon d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 1 2-2v-8a2 2 0 0 1-2-2h-8a2 2 0 0 1-2 2v8a2 2 0 0 1 2 2z" size={13} /> Copy</>
            }
          </button>
        </div>

        {/* Details grid */}
        <dl className="divide-y divide-sand-100 px-6">
          <DetailRow label="Guest Name"     value={booking.guestName} />
          <DetailRow label="Check-in"       value={formatLong(booking.checkIn)} />
          <DetailRow label="Check-out"      value={formatLong(booking.checkOut)} />
          <DetailRow label="Nights"         value={String(booking.nights)} />
          <DetailRow label="Guests"         value={String(booking.numberOfGuests)} />
          <DetailRow label="Status">
            <StatusBadge status={booking.status} />
          </DetailRow>
        </dl>
      </div>

      {/* ── Payment breakdown ── */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#F3D2BC] bg-white shadow-card">
        <div className="border-b border-[#F3D2BC] bg-[#FFF7F1] px-6 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A3412]">
            Payment Breakdown
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between border-b border-sand-100 py-3 text-sm">
            <span className="text-ink-600">Room rate</span>
            <span className="font-semibold text-ink-900">{formatPeso(booking.roomTotal)}</span>
          </div>
          <div className="flex justify-between border-b border-sand-100 py-3 text-sm">
            <span className="text-ink-600">Number of nights</span>
            <span className="font-semibold text-ink-900">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span>
          </div>
          <div className="flex justify-between border-b border-sand-100 py-3 text-sm">
            <span className="text-ink-600">Extra guest fee</span>
            <span className="font-semibold text-ink-900">{formatPeso(booking.extraGuestTotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <span className="text-sm font-bold uppercase tracking-wide text-ink-900">Total amount to pay</span>
            <span className="text-2xl font-extrabold text-[#9A3412]">{formatPeso(booking.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* ── Payment QR ── */}
      <div className="mt-8 rounded-3xl border border-sand-200 bg-[#FFF7F1] px-6 py-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9A3412]">Payment</p>
        <p className="mt-2 text-sm text-ink-700">Scan the QR code below to complete your payment.</p>
        <img
          src="/images/QR-Payment.jpg"
          alt="Payment QR code"
          className="mx-auto mt-5 h-auto w-[220px] max-w-full rounded-xl border border-sand-200 bg-white p-2"
        />
        <p className="mt-4 text-sm font-semibold text-[#9A3412]">Payment must be completed within 24 hours.</p>
        <p className="mt-1 text-xs text-ink-600">Your booking is not confirmed until payment is verified.</p>
      </div>

      {/* ── What happens next ── */}
      <div className="mt-8 rounded-3xl border border-sand-200 bg-[#FDFBF7] px-6 py-6">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-[#B88A6A]">
          What Happens Next?
        </p>
        <div className="space-y-5">
          <Step
            n={1}
            title="Complete payment"
            body="Use the QR code in your email and reply with a screenshot of your receipt within 24 hours."
          />
          <Step
            n={2}
            title="Payment verification"
            body="Yabera Suite will manually verify the payment before the booking can be confirmed."
          />
          <Step
            n={3}
            title="Booking confirmation"
            body="After verification, the host will confirm your booking and send the existing check-in details."
          />
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="flex-1 rounded-full bg-ink-900 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-md"
        >
          Back to Home
        </Link>
        <button
          onClick={handlePrint}
          className="flex-1 rounded-full border border-sand-200 py-3.5 text-center text-sm font-semibold text-ink-800 transition-all hover:border-ink-900 hover:text-ink-900"
        >
          Print / Save Details
        </button>
      </div>

    </div>
  )
}
