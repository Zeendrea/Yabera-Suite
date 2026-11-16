import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CalendarX,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
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

// ── Types ───────────────────────────────────────────────────────────────────
export type StatusFilter = 'ALL' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'EXPIRED' | 'REJECTED'
// TabKey is owned by BookingTable; StatusFilter kept for metric cards only

// ── Admin Nav Header ────────────────────────────────────────────────────────
function AdminSidebar({
  onLogout,
  activeSection,
  onNavigate,
  mobileOpen,
  onClose,
}: {
  onLogout: () => void
  activeSection: string
  onNavigate: (id: string) => void
  mobileOpen: boolean
  onClose: () => void
}) {
  const navItems = [
    { id: 'dashboard-overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'date-blocking', label: 'Date Blocking', icon: CalendarDays },
  ]

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-[#252321]/35 md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#E7DED2] bg-white transition-transform duration-200 md:visible md:translate-x-0 ${mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 border-b border-[#F0EAE2] px-6">
          <YaberaLogo variant="compact" className="h-12 w-14 shrink-0 text-[#B68B53]" />
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-[#252321]">Yabera Suites</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#927451]">Host Portal</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-2 text-[#75695D] hover:bg-[#F9F6F1] md:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-6" aria-label="Host navigation">
          {navItems.map(({ id, label, icon: NavIcon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] ${activeSection === id ? 'bg-[#F3EBDD] text-[#654B3B]' : 'text-[#75695D] hover:bg-[#FAF8F4] hover:text-[#252321]'}`}
            >
              <NavIcon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#F0EAE2] p-4">
          <div className="mb-3 flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE5D9] text-sm font-semibold text-[#654B3B]">H</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#252321]">admin</p>
              <p className="text-xs text-[#8A8178]">Host account</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#75695D] transition-colors hover:bg-[#FAF3F0] hover:text-[#9B4F42] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53]"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  icon: CardIcon,
  accent,
  active,
  onClick,
  loading,
}: {
  label: string
  value: number
  icon: typeof ClipboardList
  accent: string
  active: boolean
  onClick?: () => void
  loading: boolean
}) {
  const content = loading ? (
    <>
      <span className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-[#F0EAE2]" />
      <span className="h-3 w-24 animate-pulse rounded bg-[#F0EAE2]" />
      <span className="mt-2 h-8 w-12 animate-pulse rounded bg-[#F0EAE2]" />
    </>
  ) : (
    <>
      <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <CardIcon size={18} strokeWidth={1.8} />
      </span>
      <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#84796F]">{label}</span>
      <span className="mt-1 block font-display text-3xl font-semibold leading-tight text-[#252321]">{value}</span>
    </>
  )
  const className = `flex min-h-[132px] w-full flex-col items-start rounded-2xl border bg-white p-4 text-left shadow-[0_2px_8px_rgba(54,41,28,0.03)] transition-all duration-200 ${active ? 'border-[#B68B53] ring-1 ring-[#B68B53]/30' : 'border-[#EAE2D8]'} ${onClick ? 'hover:-translate-y-0.5 hover:border-[#CBB28E] hover:shadow-[0_8px_20px_rgba(54,41,28,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53]' : ''}`

  return onClick
    ? <button onClick={onClick} className={className}>{content}</button>
    : <div className={className}>{content}</div>
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blocks, setBlocks] = useState<BlockedDate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('AWAITING_PAYMENT')
  const [activeSection, setActiveSection] = useState('dashboard-overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  async function load(showLoading = false) {
    if (showLoading) setLoading(true)
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
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('yabera_admin_token')) {
      navigate('/admin/login')
      return
    }
    void load(true)
  }, [navigate])

  async function onStatus(id: number, status: BookingStatus) {
    try {
      await updateBookingStatus(id, status)
    } finally {
      await load()
    }
  }

  function handleLogout() {
    adminLogout()
    navigate('/admin/login')
  }

  // Derived metrics
  const today = new Date().toISOString().slice(0, 10)
  const metrics = {
    total:     bookings.length,
    pending:   bookings.filter((b) => ['AWAITING_PAYMENT', 'PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED'].includes(b.status)).length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    checkIns:  bookings.filter((b) => b.status === 'CONFIRMED' && b.checkIn >= today).length,
    checkOuts: bookings.filter((b) => b.status === 'CONFIRMED' && b.checkOut >= today).length,
    blocked:   blocks.length,
  }

  const metricCards = [
    { key: 'ALL', label: 'All Bookings', value: metrics.total, icon: ClipboardList, accent: 'bg-[#F3EEE7] text-[#80664D]', filter: 'ALL' as const },
    { key: 'AWAITING_PAYMENT', label: 'Awaiting Payment', value: metrics.pending, icon: Clock3, accent: 'bg-[#FBF2DB] text-[#92722D]', filter: 'AWAITING_PAYMENT' as const },
    { key: 'CONFIRMED', label: 'Confirmed', value: metrics.confirmed, icon: CheckCircle2, accent: 'bg-[#EAF1E7] text-[#52704B]', filter: 'CONFIRMED' as const },
    { key: 'checkin', label: 'Upcoming Check-ins', value: metrics.checkIns, icon: CalendarDays, accent: 'bg-[#EDF1F3] text-[#536B78]' },
    { key: 'checkout', label: 'Upcoming Check-outs', value: metrics.checkOuts, icon: CalendarDays, accent: 'bg-[#F2ECE5] text-[#80664D]' },
    { key: 'blocked', label: 'Blocked Dates', value: metrics.blocked, icon: CalendarX, accent: 'bg-[#F5E9E5] text-[#8B5447]' },
  ] as const

  function navigateToSection(id: string) {
    setActiveSection(id)
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] text-[#252321]">
      <AdminSidebar
        onLogout={handleLogout}
        activeSection={activeSection}
        onNavigate={navigateToSection}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen md:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E7DED2] bg-[#F9F6F1]/95 px-4 backdrop-blur sm:px-6 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#654B3B] hover:bg-[#EDE5D9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53]" aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <p className="font-display text-base font-semibold leading-tight">Yabera Suites</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#927451]">Host Portal</p>
          </div>
        </header>

      <main className="mx-auto max-w-[1500px] space-y-8 px-4 pb-12 pt-7 sm:px-6 lg:px-8">

        {/* Page title */}
        <div id="dashboard-overview" className="scroll-mt-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7546]">Yabera Suites · Host Portal</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#252321] sm:text-4xl">Dashboard overview</h1>
          <p className="mt-2 text-sm text-[#75695D]">A clear view of reservations and property availability.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-[#E8C9C0] bg-[#FBF0ED] px-4 py-3 text-sm text-[#8B4439]">
            {error}
          </div>
        )}

        {/* Metric cards */}
        <section aria-label="Booking summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {metricCards.map(({ key, label, value, icon, accent, filter }) => (
            <MetricCard
              key={key}
              label={label}
              value={value}
              icon={icon}
              accent={accent}
              active={filter !== undefined && activeFilter === filter}
              loading={loading}
              onClick={filter ? () => setActiveFilter(filter) : undefined}
            />
          ))}
        </section>

        {/* Booking table */}
        <section id="bookings" aria-label="Bookings" className="scroll-mt-24">
          <BookingTable
            bookings={bookings}
            onStatus={onStatus}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
            loading={loading}
          />
        </section>

        {/* Date blocking */}
        <section id="date-blocking" aria-label="Date blocking" className="scroll-mt-24">
          <div className="mb-4 border-b border-[#E7DED2] pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A7546]">Property availability</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#252321]">Date blocking</h2>
          </div>
          <DateBlocking
            blocks={blocks}
            onCreate={async (payload) => { await createBlockedDates(payload); await load() }}
            onRemove={async (id) => { await deleteBlockedDates(id); await load() }}
          />
        </section>

      </main>
      </div>
    </div>
  )
}
