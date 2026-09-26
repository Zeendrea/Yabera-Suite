import { useEffect, useMemo, useRef, useState } from 'react'
import { createBooking, fetchAvailability } from '../api'
import AvailabilityCalendar from '../components/AvailabilityCalendar'
import BookingForm from '../components/BookingForm'
import BookingRequestSuccess from '../components/BookingRequestSuccess'
import BookingSummary from '../components/BookingSummary'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { addDays, nightsBetween, occupancyMap, rangeHasConflict, toIso } from '../dates'
import type { BookingCreateResponse, UnavailableRange } from '../types'

type Step = 1 | 2
type AvailabilityState = 'loading' | 'loaded' | 'error'

export default function BookingPage() {
  // ── Availability ────────────────────────────────────────────────────────
  const [unavailable, setUnavailable] = useState<UnavailableRange[]>([])
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>('loading')
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0)

  // ── Date / guest selection (step 1) ────────────────────────────────────
  const [checkIn,        setCheckIn]        = useState<string | null>(null)
  const [checkOut,       setCheckOut]       = useState<string | null>(null)
  const [numberOfGuests, setNumberOfGuests] = useState(2)

  // ── Contact fields (step 2) ─────────────────────────────────────────────
  const [guestName,     setGuestName]     = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email,         setEmail]         = useState('')
  const [message,       setMessage]       = useState('')

  // ── UI state ────────────────────────────────────────────────────────────
  const [step,       setStep]       = useState<Step>(1)
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [formError,  setFormError]  = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result,     setResult]     = useState<BookingCreateResponse | null>(null)
  const submitInFlight = useRef(false)

  const occupancy = useMemo(() => occupancyMap(unavailable), [unavailable])
  const nights    = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0
  const conflict  = checkIn && checkOut ? rangeHasConflict(checkIn, checkOut, occupancy) : false

  useEffect(() => {
    const from = toIso(new Date())
    const to   = addDays(from, 240)
    let active = true
    setAvailabilityState('loading')
    fetchAvailability(from, to, availabilityAttempt > 0)
      .then((d) => {
        if (active) {
          setUnavailable(d.unavailable)
          setAvailabilityState('loaded')
        }
      })
      .catch(() => {
        if (active) setAvailabilityState('error')
      })
    return () => { active = false }
  }, [availabilityAttempt])

  // ── Field handler (step 2) ──────────────────────────────────────────────
  function onField(field: string, value: string) {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    if (field === 'guestName')     setGuestName(value)
    if (field === 'contactNumber') setContactNumber(value)
    if (field === 'email')         setEmail(value)
    if (field === 'message')       setMessage(value)
  }

  // ── Step 1 → 2 ──────────────────────────────────────────────────────────
  function goToStep2() {
    if (availabilityState !== 'loaded') return
    if (!checkIn || !checkOut || nights < 1) return
    if (conflict) {
      setFormError('Some of your selected dates are unavailable. Please choose another date.')
      return
    }
    setFormError(null)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step 2 → 1 ──────────────────────────────────────────────────────────
  function goBack() {
    setStep(1)
    setErrors({})
    setFormError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Validate & submit ───────────────────────────────────────────────────
  function validate() {
    const next: Record<string, string> = {}
    if (!guestName.trim())     next.guestName     = 'Full name is required.'
    if (!contactNumber.trim()) next.contactNumber = 'Contact number is required.'
    if (!email.trim())         next.email         = 'Email address is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit() {
    if (submitInFlight.current) return
    if (!validate() || !checkIn || !checkOut) return
    if (conflict) {
      setFormError('Some of your selected dates are unavailable. Please choose another date.')
      return
    }
    setFormError(null)
    submitInFlight.current = true
    setSubmitting(true)
    try {
      const created = await createBooking({
        guestName:      guestName.trim(),
        contactNumber:  contactNumber.trim(),
        email:          email.trim(),
        numberOfGuests,
        checkIn,
        checkOut,
        message: message.trim() || undefined,
      })
      setResult(created)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to send your request. Please try again.')
    } finally {
      submitInFlight.current = false
      setSubmitting(false)
    }
  }

  // ── Confirmation screen ─────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <BookingRequestSuccess booking={result.booking} />
        </main>
        <Footer />
      </div>
    )
  }

  // ── Booking form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">

        {/* Page heading */}
        <p className="text-sm uppercase tracking-[0.2em] text-sand-500">Availability</p>
        <h1 className="mt-2 font-display text-4xl text-ink-900">Request your stay</h1>
        <p className="mt-3 max-w-2xl text-ink-700">
          Choose your dates, select guest count, then fill in your details to submit a request.
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center gap-3">
          {[
            { n: 1, label: 'Dates & Guests' },
            { n: 2, label: 'Guest Details'  },
          ].map(({ n, label }, idx) => {
            const active = step === n
            const done   = step > n
            return (
              <div key={n} className="flex items-center gap-3">
                {idx > 0 && (
                  <div className={`h-px w-8 ${done ? 'bg-ink-900' : 'bg-sand-200'}`} />
                )}
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                    ${active ? 'bg-ink-900 text-white' : done ? 'bg-sage-500 text-white' : 'bg-sand-200 text-ink-600'}`}>
                    {done ? '✓' : n}
                  </span>
                  <span className={`text-sm font-medium ${active ? 'text-ink-900' : 'text-ink-600'}`}>
                    {label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Load error */}
        {availabilityState === 'error' && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p>Unable to load availability. Please try again.</p>
            <button
              onClick={() => {
                setAvailabilityAttempt((attempt) => attempt + 1)
                setAvailabilityState('loading')
              }}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Two-column layout — summary always visible on right */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── Left column ── */}
          <div>
            {step === 1 ? (
              /* Step 1: Calendar + guest count */
              <div className="space-y-6">
                <AvailabilityCalendar
                  unavailable={unavailable}
                  isLoading={availabilityState === 'loading'}
                  isReady={availabilityState === 'loaded'}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co) => {
                    setCheckIn(ci)
                    setCheckOut(co)
                    setFormError(null)
                  }}
                  conflictMessage={formError}
                />

                {/* Guest count */}
                <div className="rounded-[2rem] bg-white p-6 shadow-card">
                  <h3 className="font-display text-xl text-ink-900">Number of guests</h3>
                  <p className="mt-1 text-sm text-ink-700">This studio accommodates up to 4 guests.</p>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => setNumberOfGuests((n) => Math.max(1, n - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 text-ink-900 transition-colors hover:border-ink-900"
                      aria-label="Remove guest"
                    >
                      −
                    </button>
                    <span className="font-display text-3xl text-ink-900">{numberOfGuests}</span>
                    <button
                      onClick={() => setNumberOfGuests((n) => Math.min(4, n + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 text-ink-900 transition-colors hover:border-ink-900"
                      aria-label="Add guest"
                    >
                      +
                    </button>
                    <span className="ml-1 text-sm text-ink-700">
                      {numberOfGuests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                </div>

                {/* Mobile-only continue button */}
                <button
                  onClick={goToStep2}
                  disabled={availabilityState !== 'loaded' || !checkIn || !checkOut || nights < 1 || !!conflict}
                  className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                >
                  Continue to Guest Details
                </button>
              </div>
            ) : (
              /* Step 2: Contact form */
              <BookingForm
                guestName={guestName}
                contactNumber={contactNumber}
                email={email}
                message={message}
                onChange={onField}
                errors={errors}
                onBack={goBack}
              />
            )}

            {/* Submit error */}
            {formError && step === 2 && (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {formError}
              </p>
            )}

            {/* Mobile-only submit button (step 2) */}
            {step === 2 && (
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-ink-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black disabled:opacity-60 lg:hidden"
              >
                {submitting ? 'Sending request…' : 'Submit Booking Request'}
              </button>
            )}
          </div>

          {/* ── Right column — sticky summary ── */}
          <div className="hidden lg:block">
            <BookingSummary
              step={step}
              guests={numberOfGuests}
              checkIn={checkIn}
              checkOut={checkOut}
              nights={nights}
              submitting={submitting}
              onContinue={goToStep2}
              onSubmit={submit}
              continueDisabled={availabilityState !== 'loaded' || !checkIn || !checkOut || nights < 1 || !!conflict}
            />
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
