import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Eye, Search, X } from 'lucide-react'
import { formatLong } from '../dates'
import type { Booking, BookingStatus } from '../types'
import StatusBadge from './StatusBadge'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8

// Tab definitions — what each tab shows
export type TabKey = 'ALL' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'EXPIRED' | 'REJECTED'

function tabFilter(tab: TabKey, booking: Booking): boolean {
  if (tab === 'ALL') return true
  if (tab === 'AWAITING_PAYMENT') {
    return ['AWAITING_PAYMENT', 'PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED'].includes(booking.status)
  }
  return booking.status === tab
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatRequested(iso: string) {
  const d = new Date(iso)
  return d
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', ' ·') // "Sep 24 · 11:44 AM"
}

function formatPeso(amount: number | null) {
  return amount == null ? '—' : `₱${amount.toLocaleString('en-US')}`
}

function Detail({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-xs text-[#81776D]">{label}</dt>
      <dd className={`break-words text-right text-sm ${emphasized ? 'font-semibold text-[#654B3B]' : 'font-medium text-[#302D29]'}`}>
        {value}
      </dd>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny icon helper
// ─────────────────────────────────────────────────────────────────────────────

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

const I = {
  search:   'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  check:    'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  xCircle:  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  approve:  'M5 13l4 4L19 7',
  reject:   'M6 18L18 6M6 6l12 12',
  chevLeft: 'M15 19l-7-7 7-7',
  chevRight:'M9 5l7 7-7 7',
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

function ToastRack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg sm:w-auto
            ${t.type === 'success'
              ? 'border border-[#D8E3D0] bg-white text-[#302D29]'
              : 'border border-[#E8C9C0] bg-[#FBF0ED] text-[#8B4439]'}`}
        >
          <span className={`mt-0.5 shrink-0 ${t.type === 'success' ? 'text-[#52704B]' : 'text-[#9B4F42]'}`}>
            <Icon d={t.type === 'success' ? I.check : I.xCircle} size={15} />
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Row action menu
// ─────────────────────────────────────────────────────────────────────────────

function ActionMenu({
  booking,
  busy,
  onAction,
}: {
  booking: Booking
  busy: boolean
  onAction: (status: BookingStatus) => void
}) {
  const canDecide = ['AWAITING_PAYMENT', 'PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED'].includes(booking.status)
  if (!canDecide) return <span className="text-xs text-[#CCC]">—</span>

  return (
    <div className="flex min-w-[176px] flex-col gap-1.5">
      <button
        disabled={busy}
        onClick={() => onAction('CONFIRMED')}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A6A44] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3D5A37] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
        Confirm payment
      </button>
      <button
        disabled={busy}
        onClick={() => onAction('REJECTED')}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" aria-hidden="true" />}
        Reject
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs bar
// ─────────────────────────────────────────────────────────────────────────────

const TAB_META: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'REJECTED', label: 'Rejected' },
]

function TabBar({
  active,
  counts,
  onChange,
}: {
  active: TabKey
  counts: Record<TabKey, number>
  onChange: (t: TabKey) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Booking views"
      className="flex gap-1 overflow-x-auto border-b border-[#EAE2D8] bg-white px-3 pt-3 sm:px-5"
    >
      {TAB_META.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`relative mb-[-1px] flex shrink-0 items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] sm:px-4
              ${isActive
                ? 'border border-b-white border-[#EAE2D8] bg-white text-[#654B3B]'
                : 'border border-transparent text-[#81776D] hover:text-[#252321]'}`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-1 text-[10px] font-bold leading-none
                ${isActive ? 'bg-[#EDE5D9] text-[#654B3B]' : 'bg-[#F3F0EB] text-[#81776D]'}`}
            >
              {counts[key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination controls
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number
  total: number
  pageSize: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last  = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE2D8] bg-[#FAF8F4] px-4 py-3.5">
      {/* Row indicator */}
      <p className="text-xs text-[#81776D]">
        {total === 0
          ? 'No bookings'
          : `Showing ${first}–${last} of ${total} ${total === 1 ? 'booking' : 'bookings'}`}
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 items-center gap-1 rounded-lg border border-[#E7DED2] bg-white px-3 text-xs font-medium text-[#654B3B] transition-colors hover:border-[#CBB28E] hover:bg-[#F9F6F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon d={I.chevLeft} size={12} />
          Prev
        </button>

        {/* Page number pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Always show first, last, current ±1, and ellipsis markers
              return p === 1 || p === totalPages || Math.abs(p - page) <= 1
            })
            .reduce<(number | '…')[]>((acc, p, idx, arr) => {
              if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                acc.push('…')
              }
              acc.push(p)
              return acc
            }, [])
            .map((p, idx) =>
              p === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#AAA]">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onChange(p as number)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? 'page' : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors
                    ${page === p
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#E7DED2] bg-white text-[#654B3B] hover:border-[#CBB28E] hover:bg-[#F9F6F1]'}`}
                >
                  {p}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-8 items-center gap-1 rounded-lg border border-[#E7DED2] bg-white px-3 text-xs font-medium text-[#654B3B] transition-colors hover:border-[#CBB28E] hover:bg-[#F9F6F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <Icon d={I.chevRight} size={12} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  bookings: Booking[]
  onStatus: (id: number, status: BookingStatus) => Promise<void>
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  loading: boolean
}

export default function BookingTable({ bookings, onStatus, activeTab: tab, onTabChange, loading }: Props) {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toasts, setToasts]     = useState<Toast[]>([])
  const [actionDialog, setActionDialog] = useState<{ booking: Booking; status: 'CONFIRMED' | 'REJECTED' } | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Reset to page 1 whenever tab or search changes
  useEffect(() => { setPage(1) }, [tab, search])

  useEffect(() => {
    if (!selectedBooking) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedBooking(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectedBooking])

  function addToast(message: string, type: Toast['type']) {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }

  function openActionDialog(booking: Booking, status: 'CONFIRMED' | 'REJECTED') {
    setActionDialog({ booking, status })
  }

  async function handleAction() {
    if (!actionDialog) return
    const { booking, status } = actionDialog
    setLoadingId(booking.id)
    try {
      await onStatus(booking.id, status)
      addToast(
        status === 'CONFIRMED'
          ? `Booking ${booking.bookingReference} confirmed. Confirmation email sent.`
          : `Booking ${booking.bookingReference} rejected. Dates released and guest emailed.`,
        'success',
      )
      setActionDialog(null)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Action failed. Please try again.', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  // Tab counts (computed from full list, ignoring search)
  const counts = useMemo<Record<TabKey, number>>(
    () => Object.fromEntries(TAB_META.map(({ key }) => [key, bookings.filter((booking) => tabFilter(key, booking)).length])) as Record<TabKey, number>,
    [bookings],
  )

  // Apply tab filter + search
  const filtered = useMemo(() => {
    let list = bookings.filter((b) => tabFilter(tab, b))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.bookingReference.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q),
      )
    }
    return list
  }, [bookings, tab, search])

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const pageSlice  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const COLS = ['Reference', 'Guest', 'Contact & Email', 'Guests', 'Dates', 'Nights', 'Status', 'Requested', 'Actions']

  return (
    <>
      <ToastRack toasts={toasts} />

      {actionDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6" onMouseDown={(event) => {
          if (event.target === event.currentTarget && loadingId === null) setActionDialog(null)
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-action-title"
            className="w-full max-w-md rounded-2xl border border-[#E7DED2] bg-white p-6 shadow-xl"
          >
            <h2 id="booking-action-title" className="font-display text-xl font-semibold text-[#252321]">
              {actionDialog.status === 'CONFIRMED' ? 'Confirm payment' : 'Reject booking'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#75695D]">
              {actionDialog.status === 'CONFIRMED'
                ? `Confirm payment for ${actionDialog.booking.bookingReference} (${actionDialog.booking.guestName})? A confirmation email will be sent to the guest.`
                : `Reject booking ${actionDialog.booking.bookingReference}? A rejection email will be sent and the dates will be released.`}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={loadingId !== null}
                onClick={() => setActionDialog(null)}
                className="rounded-lg border border-[#E7DED2] bg-white px-4 py-2 text-sm font-medium text-[#654B3B] transition-colors hover:bg-[#F9F6F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingId !== null}
                onClick={() => void handleAction()}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${actionDialog.status === 'CONFIRMED' ? 'bg-[#52704B] hover:bg-[#405B3A] focus-visible:ring-[#52704B]' : 'bg-[#9B4F42] hover:bg-[#813F35] focus-visible:ring-[#9B4F42]'}`}
              >
                {loadingId !== null && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
                {actionDialog.status === 'CONFIRMED' ? 'Confirm payment' : 'Reject booking'}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#252321]/40 p-0 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedBooking(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <header className="sticky top-0 flex items-start justify-between border-b border-[#EAE2D8] bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A7546]">Reservation record</p>
                <h2 id="booking-details-title" className="mt-1 font-display text-2xl font-semibold text-[#252321]">Booking details</h2>
                <p className="mt-1 font-mono text-sm text-[#75695D]">{selectedBooking.bookingReference}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-[#75695D] transition-colors hover:bg-[#F5F1EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53]"
                aria-label="Close booking details"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-6 px-5 py-6 sm:px-7">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7546]">Guest</h3>
                <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  <Detail label="Guest name" value={selectedBooking.guestName} />
                  <Detail label="Contact number" value={selectedBooking.contactNumber} />
                  <Detail label="Email" value={selectedBooking.email} />
                  <Detail label="Number of guests" value={String(selectedBooking.numberOfGuests)} />
                </dl>
              </section>

              <section className="border-t border-[#EEE8E0] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7546]">Stay</h3>
                <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  <Detail label="Check-in" value={formatLong(selectedBooking.checkIn)} />
                  <Detail label="Check-out" value={formatLong(selectedBooking.checkOut)} />
                  <Detail label="Number of nights" value={String(selectedBooking.nights)} />
                  <div className="py-2">
                    <dt className="text-xs text-[#8A8178]">Status</dt>
                    <dd className="mt-1"><StatusBadge status={selectedBooking.status} /></dd>
                  </div>
                </dl>
              </section>

              <section className="border-t border-[#EEE8E0] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7546]">Price breakdown</h3>
                <dl className="mt-3 divide-y divide-[#F0EAE2] rounded-xl bg-[#FCFBF9] px-4">
                  <Detail label="Room total" value={formatPeso(selectedBooking.roomTotal)} />
                  <Detail label="Extra guest fee" value={formatPeso(selectedBooking.extraGuestTotal)} />
                  <Detail label="Total" value={formatPeso(selectedBooking.totalAmount)} emphasized />
                </dl>
              </section>

              <section className="border-t border-[#EEE8E0] pt-5">
                <Detail label="Created" value={formatRequested(selectedBooking.createdAt)} />
              </section>
            </div>
          </section>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E7DED2] bg-white shadow-[0_6px_24px_rgba(54,41,28,0.05)]">

        {/* ── Tabs ── */}
        <TabBar active={tab} counts={counts} onChange={onTabChange} />

        {/* ── Search toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#EAE2D8] bg-white px-4 py-4 sm:px-5">
          <div className="relative min-w-[220px] flex-1 sm:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8D80]">
              <Search size={16} strokeWidth={1.8} />
            </span>
            <input
              type="search"
              placeholder="Search by name, email, or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E7DED2] bg-[#FCFBF9] py-2.5 pl-10 pr-3 text-sm text-[#252321] outline-none transition-colors placeholder:text-[#9A9188] focus:border-[#B68B53] focus:bg-white focus:ring-2 focus:ring-[#B68B53]/20"
            />
          </div>
          <span className="ml-auto text-xs font-medium text-[#81776D]">
            {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="space-y-4 px-5 py-6" role="status" aria-live="polite">
            <p className="text-sm font-medium text-[#75695D]">Waking up the server, please wait...</p>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 border-b border-[#F0EAE2] py-3 last:border-0">
                <span className="h-4 w-24 animate-pulse rounded bg-[#F0EAE2]" />
                <span className="h-4 flex-1 animate-pulse rounded bg-[#F0EAE2]" />
                <span className="h-4 w-20 animate-pulse rounded bg-[#F0EAE2]" />
              </div>
            ))}
          </div>
        ) : pageSlice.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EEE7] text-[#80664D]">
              <ClipboardList size={21} strokeWidth={1.7} />
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-[#302D29]">
              {bookings.length === 0
                ? 'No booking requests yet.'
                : 'No bookings match your current view.'}
            </p>
            <p className="mt-1 text-sm text-[#81776D]">
              {bookings.length === 0 ? 'New reservations will appear here.' : 'Try a different tab or search term.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EAE2D8]">
                  {COLS.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap bg-[#FAF8F4] px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#82766B]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EDE6]">
                {pageSlice.map((booking) => {
                  const busy = loadingId === booking.id
                  return (
                    <tr key={booking.id} className="align-middle transition-colors hover:bg-[#FCFAF7]">
                      {/* Reference */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="inline-flex whitespace-nowrap items-center gap-1.5 font-mono text-xs font-semibold text-[#654B3B] transition-colors hover:text-[#9A7546] focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#B68B53]"
                          aria-label={`View details for ${booking.bookingReference}`}
                        >
                          {booking.bookingReference}
                          <Eye size={13} strokeWidth={1.8} />
                        </button>
                      </td>

                      {/* Guest */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap font-semibold text-[#302D29]">{booking.guestName}</p>
                        {booking.message && (
                          <p
                            className="mt-1 max-w-[170px] truncate text-xs text-[#897F75]"
                            title={booking.message}
                          >
                            {booking.message}
                          </p>
                        )}
                      </td>

                      {/* Contact & Email */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-[#1A1A1A]">{booking.contactNumber}</p>
                        <a
                          href={`mailto:${booking.email}`}
                          title={booking.email}
                          className="mt-0.5 block max-w-[160px] truncate text-xs text-[#B88A6A] hover:underline"
                        >
                          {booking.email}
                        </a>
                      </td>

                      {/* Guests */}
                      <td className="px-4 py-4 text-center text-[#302D29]">
                        {booking.numberOfGuests}
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-[#1A1A1A]">{formatLong(booking.checkIn)}</p>
                        <p className="whitespace-nowrap text-xs text-[#999]">→ {formatLong(booking.checkOut)}</p>
                      </td>

                      {/* Nights */}
                      <td className="px-4 py-4 text-center text-[#302D29]">
                        {booking.nights}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-4">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Date requested */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-xs text-[#555]">
                          {formatRequested(booking.createdAt)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <ActionMenu
                          booking={booking}
                          busy={busy}
                          onAction={(status) => openActionDialog(booking, status)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        <Pagination
          page={safePage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </>
  )
}
