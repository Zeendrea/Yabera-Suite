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
    <section className="rounded-[2rem] bg-white p-6 shadow-card">
      <h3 className="font-display text-2xl text-ink-900">Manual date blocking</h3>
      <p className="mt-1 text-sm text-ink-700">
        Block nights even without a guest. End date is inclusive, so Sep 18–21 blocks Sep 18, 19, 20, and 21.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-4">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-2xl border border-sand-200 px-4 py-3"
        />
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-2xl border border-sand-200 px-4 py-3"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="rounded-2xl border border-sand-200 px-4 py-3"
        />
        <button className="rounded-full bg-ink-900 px-4 py-3 font-semibold text-white">Block dates</button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      <ul className="mt-6 space-y-3">
        {blocks.map((block) => (
          <li key={block.id} className="flex items-center justify-between rounded-2xl bg-sand-50 px-4 py-3">
            <div>
              <p className="font-medium text-ink-900">
                {formatLong(block.startDate)} → {formatLong(block.endDate)}
              </p>
              <p className="text-sm text-ink-700">{block.reason}</p>
            </div>
            <button onClick={() => onRemove(block.id)} className="text-sm font-semibold text-rose-700">
              Unblock
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
