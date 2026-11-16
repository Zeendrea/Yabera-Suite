import { FormEvent, useState } from 'react'
import { formatLong } from '../dates'
import type { BlockedDate } from '../types'

interface Props {
  blocks: BlockedDate[]
  onCreate: (payload: { startDate: string; endDate: string; reason: string }) => Promise<void>
  onRemove: (id: number) => Promise<void>
}

export default function DateBlocking({ blocks, onCreate, onRemove }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('Personal use')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await onCreate({ startDate, endDate, reason })
      setStartDate('')
      setEndDate('')
      setReason('Personal use')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to block dates.')
    }
  }

  return (
    <section className="rounded-2xl border border-[#E7DED2] bg-white p-5 shadow-[0_6px_24px_rgba(54,41,28,0.05)] sm:p-6">
      <h3 className="font-display text-2xl font-semibold text-[#252321]">Manual date blocking</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#75695D]">
        Block nights even without a guest. End date is inclusive, so Sep 18–21 blocks Sep 18, 19, 20, and 21.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="min-w-0 rounded-xl border border-[#E7DED2] bg-[#FCFBF9] px-4 py-3 text-sm text-[#302D29] outline-none focus:border-[#B68B53] focus:ring-2 focus:ring-[#B68B53]/20"
        />
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="min-w-0 rounded-xl border border-[#E7DED2] bg-[#FCFBF9] px-4 py-3 text-sm text-[#302D29] outline-none focus:border-[#B68B53] focus:ring-2 focus:ring-[#B68B53]/20"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="min-w-0 rounded-xl border border-[#E7DED2] bg-[#FCFBF9] px-4 py-3 text-sm text-[#302D29] outline-none focus:border-[#B68B53] focus:ring-2 focus:ring-[#B68B53]/20"
        />
        <button className="rounded-xl bg-[#654B3B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#523B2E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53] disabled:cursor-not-allowed disabled:opacity-50">Block dates</button>
      </form>
      {error && <p role="alert" className="mt-3 rounded-lg bg-[#FBF0ED] px-3 py-2 text-sm text-[#8B4439]">{error}</p>}
      <ul className="mt-6 divide-y divide-[#EEE8E0] border-t border-[#EEE8E0]">
        {blocks.map((block) => (
          <li key={block.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-semibold text-[#302D29]">
                {formatLong(block.startDate)} → {formatLong(block.endDate)}
              </p>
              <p className="mt-1 text-sm text-[#81776D]">{block.reason}</p>
            </div>
            <button onClick={() => onRemove(block.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#8B4439] transition-colors hover:bg-[#FBF0ED] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B68B53]">
              Unblock
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
