import type { BookingStatus } from '../types'

// Status colors tuned for the #777C6D / #B7B89F / #CBCBCB / #EEEEEE palette
const config: Record<BookingStatus, { label: string; cls: string }> = {
  AWAITING_PAYMENT: { label: 'Awaiting Payment', cls: 'bg-[#FFF8E0] text-[#857830] ring-1 ring-[#D4C878]' },
  PAYMENT_SUBMITTED: { label: 'Payment Submitted', cls: 'bg-[#EAF2F8] text-[#35617A] ring-1 ring-[#A8C9DC]' },
  PAYMENT_VERIFIED: { label: 'Payment Verified', cls: 'bg-[#E8F0FA] text-[#365A86] ring-1 ring-[#A8BDD9]' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-[#E4EDE0] text-[#4A6A44] ring-1 ring-[#A4C49C]' },
  EXPIRED: { label: 'Expired', cls: 'bg-[#EEEEEE] text-[#777C6D] ring-1 ring-[#CBCBCB]' },
  REJECTED: { label: 'Rejected', cls: 'bg-[#F4E8E4] text-[#8A4A3A] ring-1 ring-[#CCA090]' },
  PENDING: { label: 'Legacy Pending', cls: 'bg-[#FFF8E0] text-[#857830] ring-1 ring-[#D4C878]' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-[#EEEEEE] text-[#777C6D] ring-1 ring-[#CBCBCB]' },
}

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, cls } = config[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
