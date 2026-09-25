import type { UnavailableRange } from '../types'

export function toIso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIso(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number) {
  const date = parseIso(iso)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const start = parseIso(checkIn)
  const end = parseIso(checkOut)
  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

export function eachNight(checkIn: string, checkOut: string) {
  const nights: string[] = []
  let cursor = checkIn
  while (cursor < checkOut) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function eachNightInclusive(startDate: string, endDate: string) {
  const nights: string[] = []
  let cursor = startDate
  while (cursor <= endDate) {
    nights.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return nights
}

export function formatLong(iso: string) {
  return parseIso(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1)
}

export type DayKind = 'available' | 'booked' | 'pending' | 'past'

export function occupancyMap(ranges: UnavailableRange[]) {
  const map = new Map<string, DayKind>()
  for (const range of ranges) {
    const kind: DayKind = range.type === 'PENDING' ? 'pending' : 'booked'
    const nights = range.type === 'BLOCKED' ? eachNightInclusive(range.start, range.end) : eachNight(range.start, range.end)
    for (const night of nights) {
      if (kind === 'booked' || map.get(night) !== 'booked') {
        map.set(night, kind)
      }
    }
  }
  return map
}

export function rangeHasConflict(checkIn: string, checkOut: string, occupancy: Map<string, DayKind>) {
  return eachNight(checkIn, checkOut).some((night) => occupancy.has(night))
}

// ── Pricing ──────────────────────────────────────────────────────────────────

const RATE_WEEKDAY       = 1999   // Sun–Thu
const RATE_WEEKEND       = 2299   // Fri–Sat
const RATE_DISCOUNT      = 1799   // Any night when stay >= 3 nights
const EXTRA_GUEST_FEE    = 300    // per extra guest per night (guests > 2)

export interface PriceBreakdown {
  weekdayNights:    number
  weekendNights:    number
  discountApplied:  boolean
  savedAmount:      number
  extraGuests:      number
  extraGuestTotal:  number
  roomTotal:        number
  total:            number
  lines:            { label: string; amount: number }[]
}

/**
 * Compute full pricing for a stay including guest fees.
 *
 * checkIn  = first night  (ISO "YYYY-MM-DD")
 * checkOut = departure day (not a charged night)
 * guests   = number of guests (1–4); fee applied for guests > 2
 */
export function computePrice(checkIn: string, checkOut: string, guests = 1): PriceBreakdown {
  const nights         = eachNight(checkIn, checkOut)
  const n              = nights.length
  const discountApplied = n >= 3
  const extraGuests    = Math.max(0, guests - 2)  // 0, 1, or 2

  const weekdayNights = nights.filter((d) => { const dow = parseIso(d).getDay(); return dow !== 5 && dow !== 6 }).length
  const weekendNights = nights.filter((d) => { const dow = parseIso(d).getDay(); return dow === 5 || dow === 6 }).length

  const lines: { label: string; amount: number }[] = []
  let roomTotal = 0

  if (discountApplied) {
    roomTotal = n * RATE_DISCOUNT
    // Calculate what it would have cost without discount
    const undiscountedRoom = weekdayNights * RATE_WEEKDAY + weekendNights * RATE_WEEKEND
    const savedAmount       = undiscountedRoom - roomTotal

    lines.push({
      label:  `Extended stay · ${n} night${n > 1 ? 's' : ''} × ₱${RATE_DISCOUNT.toLocaleString()}`,
      amount: roomTotal,
    })

    const extraGuestTotal = extraGuests * EXTRA_GUEST_FEE * n
    if (extraGuests > 0) {
      lines.push({
        label:  `Extra guest fee · ${extraGuests} extra × ₱${EXTRA_GUEST_FEE.toLocaleString()} × ${n} night${n > 1 ? 's' : ''}`,
        amount: extraGuestTotal,
      })
    }

    return {
      weekdayNights,
      weekendNights,
      discountApplied: true,
      savedAmount,
      extraGuests,
      extraGuestTotal,
      roomTotal,
      total: roomTotal + extraGuestTotal,
      lines,
    }
  }

  // No discount — standard rates
  if (weekdayNights > 0) {
    const amt = weekdayNights * RATE_WEEKDAY
    roomTotal += amt
    lines.push({
      label:  `Weekday · ${weekdayNights} night${weekdayNights > 1 ? 's' : ''} × ₱${RATE_WEEKDAY.toLocaleString()}`,
      amount: amt,
    })
  }
  if (weekendNights > 0) {
    const amt = weekendNights * RATE_WEEKEND
    roomTotal += amt
    lines.push({
      label:  `Weekend · ${weekendNights} night${weekendNights > 1 ? 's' : ''} × ₱${RATE_WEEKEND.toLocaleString()}`,
      amount: amt,
    })
  }

  const extraGuestTotal = extraGuests * EXTRA_GUEST_FEE * n
  if (extraGuests > 0) {
    lines.push({
      label:  `Extra guest fee · ${extraGuests} extra × ₱${EXTRA_GUEST_FEE.toLocaleString()} × ${n} night${n > 1 ? 's' : ''}`,
      amount: extraGuestTotal,
    })
  }

  return {
    weekdayNights,
    weekendNights,
    discountApplied: false,
    savedAmount:     0,
    extraGuests,
    extraGuestTotal,
    roomTotal,
    total: roomTotal + extraGuestTotal,
    lines,
  }
}
