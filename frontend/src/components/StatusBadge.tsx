import type { BookingStatus } from '../types'

const config: Record<BookingStatus, { label: string; cls: string }> = {
  AWAITING_PAYMENT: { label: 'Awaiting Payment', cls: 'bg-[#FBF2DB] text-[#765D24] ring-1 ring-[#E5D29A]' },
  PAYMENT_SUBMITTED: { label: 'Payment Submitted', cls: 'bg-[#F0EEE8] text-[#6D6256] ring-1 ring-[#D8CFC2]' },
  PAYMENT_VERIFIED: { label: 'Payment Verified', cls: 'bg-[#F0EEE8] text-[#6D6256] ring-1 ring-[#D8CFC2]' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-[#EAF1E7] text-[#45633E] ring-1 ring-[#C5D6BC]' },
  EXPIRED: { label: 'Expired', cls: 'bg-[#F0EEE9] text-[#68645E] ring-1 ring-[#D8D4CD]' },
  REJECTED: { label: 'Rejected', cls: 'bg-[#F8EBE8] text-[#8B4439] ring-1 ring-[#E7C8C0]' },
  PENDING: { label: 'Legacy Pending', cls: 'bg-[#FBF2DB] text-[#765D24] ring-1 ring-[#E5D29A]' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-[#F0EEE9] text-[#68645E] ring-1 ring-[#D8D4CD]' },
}

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, cls } = config[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
