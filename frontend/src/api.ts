import type { AvailabilityResponse, BlockedDate, Booking, BookingCreateResponse, BookingStatus } from './types'

const API = import.meta.env.VITE_API_URL ?? ''

function authHeader() {
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

export async function fetchAvailability(from: string, to: string) {
  const params = new URLSearchParams({ from, to })
  return parse<AvailabilityResponse>(await fetch(`${API}/api/availability?${params}`))
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
  return parse<BookingCreateResponse>(
    await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
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
