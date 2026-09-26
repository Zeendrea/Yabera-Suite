import type { ReactNode } from 'react'

interface Props {
  guestName: string
  contactNumber: string
  email: string
  message: string
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
  onBack: () => void
}

export default function BookingForm({
  guestName, contactNumber, email, message, onChange, errors, onBack,
}: Props) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-card">
      {/* Back link */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to dates
      </button>

      <h3 className="font-display text-2xl text-ink-900">Guest details</h3>
      <p className="mt-1 text-sm text-ink-700">
        We'll send this as a booking request — not an instant confirmation.
      </p>

      <div className="mt-6 grid gap-4">
        <Field label="Full Name" error={errors.guestName}>
          <input
            type="text"
            autoComplete="name"
            value={guestName}
            onChange={(e) => onChange('guestName', e.target.value)}
            placeholder="e.g. Maria Santos"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Contact Number" error={errors.contactNumber}>
          <input
            type="tel"
            autoComplete="tel"
            value={contactNumber}
            onChange={(e) => onChange('contactNumber', e.target.value)}
            placeholder="e.g. 09171234567"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="e.g. maria@email.com"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Special Request (optional)">
          <textarea
            value={message}
            onChange={(e) => onChange('message', e.target.value)}
            placeholder="Any requests or notes for the host…"
            className={`${inputCls} min-h-[100px] resize-none`}
            maxLength={1000}
          />
        </Field>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-sand-400 focus:border-ink-800 focus:ring-1 focus:ring-ink-800'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-ink-800">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}
