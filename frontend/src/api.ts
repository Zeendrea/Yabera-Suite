import type { AvailabilityResponse, BlockedDate, Booking, BookingCreateResponse, BookingStatus } from './types'

// ── Base URL resolution — logged at startup so you can see it in the console ──
const _rawApiUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '')

const API = _rawApiUrl.replace(/\/$/, '')

// Emit once so the Network tab URL-prefix and this value can be cross-checked.
// If this prints "(empty — same-origin)" in production it means VITE_API_BASE_URL
// was not set at build time — the most common cause of the "Unable to load availability" error.
if (!import.meta.env.DEV && !_rawApiUrl) {
  console.error(
    '[api] ⚠️  VITE_API_BASE_URL is not set in this production build.\n' +
    'All API requests will be sent to the same origin as the frontend host.\n' +
    'If the frontend and backend are on different hosts, add VITE_API_BASE_URL to your deployment env vars and redeploy.',
  )
}
console.info(
  `[api] Base URL resolved to: "${API || '(empty — same-origin)'}"`,
  import.meta.env.DEV ? '(DEV)' : '(PROD)',
)

const AVAILABILITY_CACHE_MS   = 30_000
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
    error.code   = (data as { code?: string }).code
    error.status = response.status
    throw error
  }
  return data as T
}

export async function fetchAvailability(from: string, to: string, forceRefresh = false) {
  const params  = new URLSearchParams({ from, to })
  const url     = `${API}/api/availability?${params}`
  const key     = `${from}:${to}`
  const cached  = availabilityCache.get(key)

  if (!forceRefresh && cached && (cached.expiresAt === null || cached.expiresAt > Date.now())) {
    return cached.request
  }

  console.info('[api] fetchAvailability →', url)

  const request = fetch(url, { signal: AbortSignal.timeout(AVAILABILITY_TIMEOUT_MS) })
    .then(async (response) => {
      console.info('[api] fetchAvailability ←', response.status, response.url)

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        console.error(
          `[api] fetchAvailability HTTP ${response.status} from ${response.url}`,
          '\nResponse body:', body || '(empty)',
        )
        throw new Error(`Server returned ${response.status}`)
      }

      return parse<AvailabilityResponse>(response)
    })
    .then((data) => {
      if (!Array.isArray(data.unavailable) || typeof data.from !== 'string' || typeof data.to !== 'string') {
        console.error('[api] fetchAvailability: invalid response shape', data)
        throw new Error('The availability response was invalid.')
      }
      const entry = availabilityCache.get(key)
      if (entry?.request === request) entry.expiresAt = Date.now() + AVAILABILITY_CACHE_MS
      return data
    })
    .catch((error: unknown) => {
      if (availabilityCache.get(key)?.request === request) availabilityCache.delete(key)

      // Distinguish the three common failure modes and log clearly
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        console.error(`[api] fetchAvailability TIMEOUT after ${AVAILABILITY_TIMEOUT_MS}ms — backend may be sleeping (cold start). URL: ${url}`)
      } else if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
        console.error(
          `[api] fetchAvailability NETWORK ERROR — possible causes:\n` +
          `  1. VITE_API_BASE_URL is wrong or missing in your deployment env vars.\n` +
          `  2. The backend at "${API}" is unreachable (down, wrong URL, or HTTP/HTTPS mismatch).\n` +
          `  3. CORS is blocking the preflight request.\n` +
          `Original error:`, error,
        )
      } else {
        console.error('[api] fetchAvailability FAILED:', error)
      }

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