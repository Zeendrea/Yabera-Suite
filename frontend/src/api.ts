import type { AvailabilityResponse, BlockedDate, Booking, BookingCreateResponse, BookingStatus } from './types'

const API = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://yabera-suite.onrender.com')).replace(/\/$/, '')
const AVAILABILITY_CACHE_MS = 30_000
const AVAILABILITY_TIMEOUT_MS = 30_000
const availabilityCache = new Map<string, { expiresAt: number | null; request: Promise<AvailabilityResponse> }>()

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('yabera_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = (data as { message?: string }).message ?? 'Something went wrong. Please try again.'
    const error = new Error(message) as Error & { code?: string; status?: number }
    error.code = (data as { code?: string }).code
    error.status = response.status
    throw error
  }
  return data as T
}

export async function fetchAvailability(from: string, to: string, forceRefresh = false) {
  const params = new URLSearchParams({ from, to })
  const key = `${from}:${to}`
  const cached = availabilityCache.get(key)
  if (!forceRefresh && cached && (cached.expiresAt === null || cached.expiresAt > Date.now())) {
    return cached.request
  }

  const request = fetch(`${API}/api/availability?${params}`, {
    signal: AbortSignal.timeout(AVAILABILITY_TIMEOUT_MS),
  })
    .then(parse<AvailabilityResponse>)
    .then((data) => {
      if (!Array.isArray(data.unavailable) || typeof data.from !== 'string' || typeof data.to !== 'string') {
        throw new Error('The availability response was invalid.')
      }
      const entry = availabilityCache.get(key)
      if (entry?.request === request) entry.expiresAt = Date.now() + AVAILABILITY_CACHE_MS
      return data
    })
    .catch((error: unknown) => {
      if (availabilityCache.get(key)?.request === request) availabilityCache.delete(key)
      throw error
    })
  availabilityCache.set(key, { expiresAt: null, request })
  return request
}

export async function createBooking(payload: {
  guestName: string
  contactNumber: string
  email: string
  numberOfGuests: number
  checkIn: string
  checkOut: string
  message?: string
}) {
  const created = await parse<BookingCreateResponse>(
    await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
  availabilityCache.clear()
  return created
}

export async function adminLogin(username: string, password: string) {
  const data = await parse<{ token: string; username: string }>(
    await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  )
  localStorage.setItem('yabera_admin_token', data.token)
  return data
}

export function adminLogout() {
  localStorage.removeItem('yabera_admin_token')
}

export async function fetchAdminBookings() {
  return parse<Booking[]>(
    await fetch(`${API}/api/admin/bookings`, {
      headers: { ...authHeader() },
    }),
  )
}

export async function updateBookingStatus(id: number, status: BookingStatus) {
  return parse<Booking>(
    await fetch(`${API}/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status }),
    }),
  )
}

export async function fetchBlockedDates() {
  return parse<BlockedDate[]>(
    await fetch(`${API}/api/admin/blocked-dates`, {
      headers: { ...authHeader() },
    }),
  )
}

export async function createBlockedDates(payload: { startDate: string; endDate: string; reason: string }) {
  return parse<BlockedDate>(
    await fetch(`${API}/api/admin/blocked-dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(payload),
    }),
  )
}

export async function deleteBlockedDates(id: number) {
  const response = await fetch(`${API}/api/admin/blocked-dates/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? 'Unable to remove block.')
  }
}