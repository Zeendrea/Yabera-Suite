import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  adminLogout,
  createBlockedDates,
  deleteBlockedDates,
  fetchAdminBookings,
  fetchBlockedDates,
  updateBookingStatus,
} from '../api'
import type { BlockedDate, Booking, BookingStatus } from '../types'
import BookingTable from './BookingTable'
import DateBlocking from './DateBlocking'
import YaberaLogo from './YaberaLogo'

// ── Icons (inline SVG — no extra dep) ──────────────────────────────────────
function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  total:     'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2',
  pending:   'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  confirmed: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  checkIn:   'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1',
  checkOut:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1',
  blocked:   'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
  logout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1',
}

// ── Types ───────────────────────────────────────────────────────────────────
export type StatusFilter = BookingStatus | 'ALL'
// TabKey is owned by BookingTable; StatusFilter kept for metric cards only

// ── Admin Nav Header ────────────────────────────────────────────────────────
function AdminHeader({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-[#EDE8E1] bg-[#FDFBF7]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        {/* Logo */}
        <div className="flex items-center gap-3">
          <YaberaLogo variant="compact" className="h-10 w-auto text-[#B8935A]" />
          <div className="hidden sm:block">
            <span className="block font-serif text-base font-semibold leading-tight tracking-tight text-[#1A1A1A]">
              Yabera Suites
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#B8935A]">
              Host Portal
            </span>
          </div>
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-bold text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
          >
            H
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-[#EDE8E1] bg-white shadow-lg">
              <div className="border-b border-[#F2EBE1] px-4 py-3">
                <p className="text-xs font-semibold text-[#1A1A1A]">admin</p>
                <p className="text-xs text-[#999]">Host account</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); onLogout() }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-600 transition-colors hover:bg-rose-50"
              >
                <Icon d={ICONS.logout} size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  iconPath,
  accent,
  active,
  onClick,
}: {
  label: string
  value: number
  iconPath: string
  accent: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]
        ${active
          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md'
          : 'border-[#EDE8E1] bg-white text-[#1A1A1A] hover:border-[#C9B89A] hover:shadow-md'
        }`}
    >
      <div className={`mb-3 inline-flex rounded-xl p-2 ${active ? 'bg-white/15' : accent}`}>
        <span className={active ? 'text-white' : ''}>
          <Icon d={iconPath} size={16} />
        </span>
      </div>
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${active ? 'text-white/70' : 'text-[#999]'}`}>
        {label}
      </p>
      <p className={`mt-1 font-serif text-3xl font-semibold ${active ? 'text-white' : 'text-[#1A1A1A]'}`}>
        {value}
      </p>
    </button>
  )
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blocks, setBlocks] = useState<BlockedDate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL')

  async function load() {
    try {
      const [nextBookings, nextBlocks] = await Promise.all([fetchAdminBookings(), fetchBlockedDates()])
      setBookings(nextBookings)
      setBlocks(nextBlocks)
      setError(null)
    } catch (err) {
      const status = (err as Error & { status?: number }).status
      if (status === 401 || status === 403) {
        adminLogout()
        navigate('/admin/login')
        return
      }
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('yabera_admin_token')) {
      navigate('/admin/login')
      return
    }
    void load()
  }, [navigate])

  async function onStatus(id: number, status: BookingStatus) {
    await updateBookingStatus(id, status)
    await load()
  }

  function handleLogout() {
    adminLogout()
    navigate('/admin/login')
  }

  // Derived metrics
  const today = new Date().toISOString().slice(0, 10)
  const metrics = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    checkIns:  bookings.filter((b) => b.status === 'CONFIRMED' && b.checkIn >= today).length,
    checkOuts: bookings.filter((b) => b.status === 'CONFIRMED' && b.checkOut >= today).length,
    blocked:   blocks.length,
  }

  const metricCards = [
    { key: 'ALL',       label: 'All Bookings',   value: metrics.total,     icon: ICONS.total,     accent: 'bg-[#F2EBE1] text-[#B88A6A]' },
    { key: 'PENDING',   label: 'Pending',         value: metrics.pending,   icon: ICONS.pending,   accent: 'bg-amber-50 text-amber-600'   },
    { key: 'CONFIRMED', label: 'Confirmed',       value: metrics.confirmed, icon: ICONS.confirmed, accent: 'bg-green-50 text-green-600'   },
    { key: 'checkin',   label: 'Upcoming Check-ins',  value: metrics.checkIns,  icon: ICONS.checkIn,  accent: 'bg-sky-50 text-sky-600'   },
    { key: 'checkout',  label: 'Upcoming Check-outs', value: metrics.checkOuts, icon: ICONS.checkOut, accent: 'bg-violet-50 text-violet-600'},
    { key: 'blocked',   label: 'Blocked Dates',   value: metrics.blocked,   icon: ICONS.blocked,   accent: 'bg-rose-50 text-rose-500'    },
  ] as const

  function handleMetricClick(key: string) {
    if (key === 'ALL' || key === 'PENDING' || key === 'CONFIRMED') {
      setActiveFilter(key as StatusFilter)
    }
    // checkin / checkout / blocked don't map to a status filter — just deselect
    else {
      setActiveFilter('ALL')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <AdminHeader onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-16 pt-10 sm:px-6">

        {/* Page title */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B88A6A]">Host tools</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1A1A1A]">Admin dashboard</h1>
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Metric cards */}
        <section aria-label="Booking summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metricCards.map(({ key, label, value, icon, accent }) => (
            <MetricCard
              key={key}
              label={label}
              value={value}
              iconPath={icon}
              accent={accent}
              active={activeFilter === key}
              onClick={() => handleMetricClick(key)}
            />
          ))}
        </section>

        {/* Booking table */}
        <section aria-label="Bookings">
          <BookingTable
            bookings={bookings}
            onStatus={onStatus}
          />
        </section>

        {/* Date blocking */}
        <section aria-label="Date blocking">
          <DateBlocking
            blocks={blocks}
            onCreate={async (payload) => { await createBlockedDates(payload); await load() }}
            onRemove={async (id) => { await deleteBlockedDates(id); await load() }}
          />
        </section>

      </main>
    </div>
  )
}
