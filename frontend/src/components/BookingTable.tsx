import { useEffect, useMemo, useRef, useState } from 'react'
import { formatLong } from '../dates'
import type { Booking, BookingStatus } from '../types'
import StatusBadge from './StatusBadge'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8

// Tab definitions — what each tab shows
export type TabKey = BookingStatus | 'ALL'

function tabFilter(tab: TabKey, booking: Booking): boolean {
  return tab === 'ALL' || booking.status === tab
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
  dots:     'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2',
  approve:  'M5 13l4 4L19 7',
  reject:   'M6 18L18 6M6 6l12 12',
  cancel:   'M9 9l6 6m0-6l-6 6',
  chevLeft: 'M15 19l-7-7 7-7',
  chevRight:'M9 5l7 7-7 7',
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' }

function ToastRack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg
            ${t.type === 'success'
              ? 'border border-[#D4E8CC] bg-white text-[#1A1A1A]'
              : 'border border-rose-200 bg-rose-50 text-rose-800'}`}
        >
          <span className={`mt-0.5 shrink-0 ${t.type === 'success' ? 'text-green-600' : 'text-rose-500'}`}>
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
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const actions: { label: string; status: BookingStatus; icon: string; cls: string }[] = []
  if (booking.status === 'AWAITING_PAYMENT' || booking.status === 'PENDING') {
    actions.push({ label: 'Payment submitted', status: 'PAYMENT_SUBMITTED', icon: I.approve, cls: 'text-sky-700 hover:bg-sky-50' })
    actions.push({ label: 'Reject',  status: 'REJECTED',  icon: I.reject,  cls: 'text-rose-600 hover:bg-rose-50'  })
  }
  if (booking.status === 'PAYMENT_SUBMITTED') {
    actions.push({ label: 'Verify payment', status: 'PAYMENT_VERIFIED', icon: I.approve, cls: 'text-blue-700 hover:bg-blue-50' })
    actions.push({ label: 'Reject',  status: 'REJECTED',  icon: I.reject,  cls: 'text-rose-600 hover:bg-rose-50'  })
  }
  if (booking.status === 'PAYMENT_VERIFIED') {
    actions.push({ label: 'Confirm booking', status: 'CONFIRMED', icon: I.approve, cls: 'text-green-700 hover:bg-green-50' })
    actions.push({ label: 'Reject',  status: 'REJECTED',  icon: I.reject,  cls: 'text-rose-600 hover:bg-rose-50'  })
  }
  if (booking.status === 'CONFIRMED') {
    actions.push({ label: 'Cancel',  status: 'CANCELLED', icon: I.cancel,  cls: 'text-rose-600 hover:bg-rose-50'  })
  }

  if (actions.length === 0) return <span className="text-xs text-[#CCC]">—</span>

  return (
    <div className="relative" ref={ref}>
      <button
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDE8E1] bg-white text-[#666] transition-colors hover:border-[#C9B89A] hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy
          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#CCC] border-t-[#1A1A1A]" />
          : <Icon d={I.dots} size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-[#EDE8E1] bg-white shadow-lg">
          {actions.map((a) => (
            <button
              key={a.status}
              onClick={() => { setOpen(false); onAction(a.status) }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${a.cls}`}
            >
              <Icon d={a.icon} size={13} />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs bar
// ─────────────────────────────────────────────────────────────────────────────

const TAB_META: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
  { key: 'PAYMENT_SUBMITTED', label: 'Payment Submitted' },
  { key: 'PAYMENT_VERIFIED', label: 'Payment Verified' },
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
      className="flex flex-wrap gap-1 border-b border-[#EDE8E1] bg-[#FAF7F2] px-4 pt-3"
    >
      {TAB_META.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`relative mb-[-1px] flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]
              ${isActive
                ? 'border border-b-white border-[#EDE8E1] bg-white text-[#1A1A1A]'
                : 'border border-transparent text-[#888] hover:text-[#1A1A1A]'}`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                ${isActive ? 'bg-[#1A1A1A] text-white' : 'bg-[#E8E0D8] text-[#888]'}`}
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE8E1] bg-[#FAF7F2] px-4 py-3">
      {/* Row indicator */}
      <p className="text-xs text-[#888]">
        {total === 0
          ? 'No bookings'
          : `Showing ${first}–${last} of ${total} ${total === 1 ? 'booking' : 'bookings'}`}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 items-center gap-1 rounded-lg border border-[#EDE8E1] bg-white px-3 text-xs font-medium text-[#555] transition-colors hover:border-[#C9B89A] hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40"
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
                      : 'border border-[#EDE8E1] bg-white text-[#555] hover:border-[#C9B89A] hover:bg-[#FAF7F2]'}`}
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
          className="flex h-8 items-center gap-1 rounded-lg border border-[#EDE8E1] bg-white px-3 text-xs font-medium text-[#555] transition-colors hover:border-[#C9B89A] hover:bg-[#FAF7F2] disabled:cursor-not-allowed disabled:opacity-40"
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
}

export default function BookingTable({ bookings, onStatus }: Props) {
  const [tab, setTab]           = useState<TabKey>('active')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toasts, setToasts]     = useState<Toast[]>([])

  // Reset to page 1 whenever tab or search changes
  useEffect(() => { setPage(1) }, [tab, search])

  function addToast(message: string, type: Toast['type']) {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }

  async function handleAction(booking: Booking, status: BookingStatus) {
    setLoadingId(booking.id)
    try {
      await onStatus(booking.id, status)
      const msgs: Record<BookingStatus, string> = {
        AWAITING_PAYMENT: '',
        PAYMENT_SUBMITTED: `Payment marked as submitted for ${booking.bookingReference}.`,
        PAYMENT_VERIFIED: `Payment verified for ${booking.bookingReference}.`,
        CONFIRMED: `Booking confirmed — email sent to ${booking.email}.`,
        EXPIRED: `Booking ${booking.bookingReference} expired.`,
        REJECTED: `Booking ${booking.bookingReference} rejected.`,
        PENDING: '',
        CANCELLED: `Booking ${booking.bookingReference} cancelled.`,
      }
      addToast(msgs[status], 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Action failed. Please try again.', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  // Tab counts (computed from full list, ignoring search)
  const counts = useMemo<Record<TabKey, number>>(
    () => Object.fromEntries(TAB_META.map(({ key }) => [key, key === 'ALL' ? bookings.length : bookings.filter((b) => b.status === key).length])) as Record<TabKey, number>,
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

      <div className="overflow-hidden rounded-2xl border border-[#EDE8E1] bg-white shadow-sm">

        {/* ── Tabs ── */}
        <TabBar active={tab} counts={counts} onChange={setTab} />

        {/* ── Search toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#EDE8E1] px-4 py-3">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA]">
              <Icon d={I.search} size={14} />
            </span>
            <input
              type="search"
              placeholder="Search by name, email, or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E8DFD5] bg-white py-2 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-[#BBB] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
            />
          </div>
          <span className="ml-auto text-xs text-[#999]">
            {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>

        {/* ── Table ── */}
        {pageSlice.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#999]">
              {bookings.length === 0
                ? 'No booking requests yet.'
                : 'No bookings match your current view.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EDE8E1] bg-[#FAF7F2]">
                  {COLS.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#999]"
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
                    <tr
                      key={booking.id}
                      className="align-middle transition-colors hover:bg-[#FDFAF6]"
                    >
                      {/* Reference */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-[#1A1A1A]">
                          {booking.bookingReference}
                        </span>
                      </td>

                      {/* Guest */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-[#1A1A1A]">{booking.guestName}</p>
                        {booking.message && (
                          <p
                            className="mt-0.5 max-w-[140px] truncate text-xs text-[#999]"
                            title={booking.message}
                          >
                            {booking.message}
                          </p>
                        )}
                      </td>

                      {/* Contact & Email */}
                      <td className="px-4 py-3.5">
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
                      <td className="px-4 py-3.5 text-center text-[#1A1A1A]">
                        {booking.numberOfGuests}
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3.5">
                        <p className="whitespace-nowrap text-[#1A1A1A]">{formatLong(booking.checkIn)}</p>
                        <p className="whitespace-nowrap text-xs text-[#999]">→ {formatLong(booking.checkOut)}</p>
                      </td>

                      {/* Nights */}
                      <td className="px-4 py-3.5 text-center text-[#1A1A1A]">
                        {booking.nights}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Date requested */}
                      <td className="px-4 py-3.5">
                        <p className="whitespace-nowrap text-xs text-[#555]">
                          {formatRequested(booking.createdAt)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          booking={booking}
                          busy={busy}
                          onAction={(status) => handleAction(booking, status)}
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
