import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { occupancyMap, rangeHasConflict, toIso, type DayKind } from '../dates'
import type { UnavailableRange } from '../types'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Props {
  unavailable: UnavailableRange[]
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
  conflictMessage?: string | null
  isLoading?: boolean
  isReady?: boolean
}

export default function AvailabilityCalendar({
  unavailable, checkIn, checkOut, onChange, conflictMessage, isLoading = false, isReady = true,
}: Props) {
  const today = toIso(new Date())
  const now   = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const occupancy = useMemo(() => occupancyMap(unavailable), [unavailable])

  function dayKind(iso: string): DayKind {
    if (iso < today) return 'past'
    return occupancy.get(iso) ?? 'available'
  }

  // Is this day inside the selected range (exclusive of checkOut endpoint)?
  function inRange(iso: string) {
    if (!checkIn || !checkOut) return false
    return iso > checkIn && iso < checkOut
  }

  function isStart(iso: string) { return iso === checkIn }
  function isEnd(iso: string)   { return iso === checkOut }

  function pickingCheckIn() {
    return !checkIn || Boolean(checkOut)
  }

  function canSelect(iso: string) {
    if (!isReady) return false
    if (iso < today) return false
    if (occupancy.get(iso) === 'booked' || occupancy.get(iso) === 'pending') {
      // only allow selecting as check-in if it's not occupied
      return false
    }
    if (pickingCheckIn() || (checkIn && iso <= checkIn)) {
      return true
    }
    return !rangeHasConflict(checkIn!, iso, occupancy)
  }

  function select(iso: string) {
    if (!canSelect(iso)) return
    if (pickingCheckIn() || iso <= checkIn!) {
      onChange(iso, null)
    } else {
      onChange(checkIn, iso)
    }
  }

  function prevMonth() {
    setCursor((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 })
  }
  function nextMonth() {
    setCursor((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 })
  }

  const first        = new Date(cursor.year, cursor.month, 1)
  const startWeekday = first.getDay()
  const daysInMonth  = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells: (string | null)[] = [...Array(startWeekday).fill(null)]
  for (let d = 1; d <= daysInMonth; d++) cells.push(toIso(new Date(cursor.year, cursor.month, d)))

  const selectedConflict = checkIn && checkOut ? rangeHasConflict(checkIn, checkOut, occupancy) : false

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-card sm:p-6">
      {/* Month nav */}
      <div className="mb-5 flex items-center justify-between">
        <button onClick={prevMonth} aria-label="Previous month"
          className="rounded-full p-2 text-ink-700 transition-colors hover:bg-sand-100">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-display text-xl text-ink-900">
          {first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} aria-label="Next month"
          className="rounded-full p-2 text-ink-700 transition-colors hover:bg-sand-100">
          <ChevronRight size={20} />
        </button>
      </div>

      {isLoading && (
        <p className="mb-2 text-center text-xs text-ink-600" role="status" aria-live="polite">
          Checking availability…
        </p>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((iso, idx) => {
          if (!iso) return <div key={`e-${idx}`} />
          const kind     = dayKind(iso)
          const start    = isStart(iso)
          const end      = isEnd(iso)
          const mid      = inRange(iso)
          const disabled = !canSelect(iso)
          const isPast   = kind === 'past'
          const isBooked = kind === 'booked'
          const isPending= kind === 'pending'

          return (
            <div key={iso} className={`relative flex h-11 items-center justify-center sm:h-12
              ${mid ? 'bg-sand-100' : ''}
              ${start && checkOut ? 'rounded-l-full' : ''}
              ${end ? 'rounded-r-full' : ''}
            `}>
              <button
                disabled={disabled}
                onClick={() => select(iso)}
                aria-label={iso}
                className={[
                  'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  start || end
                    ? 'bg-ink-900 text-white shadow-sm'
                    : mid
                      ? 'text-ink-900 hover:bg-sand-200'
                      : isBooked
                        ? 'cursor-not-allowed bg-rose-50 text-rose-400 line-through'
                        : isPending
                          ? 'cursor-not-allowed bg-amber-50 text-amber-500 line-through'
                          : isPast
                            ? 'cursor-not-allowed text-sand-300'
                            : 'text-ink-800 hover:bg-sand-100',
                ].join(' ')}
              >
                {Number(iso.slice(-2))}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-ink-700">
        <Legend color="bg-ink-900"   label="Check-in / out" />
        <Legend color="bg-sand-200"  label="Your stay" />
        <Legend color="bg-rose-200"  label="Booked" />
        <Legend color="bg-amber-200" label="Pending" />
      </div>

      {/* Conflict warning */}
      {(selectedConflict || conflictMessage) && (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {conflictMessage ?? 'Some of your selected dates are unavailable. Please choose another date.'}
        </p>
      )}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
