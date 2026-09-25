import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'
import YaberaLogo from '../components/YaberaLogo'

// Palette
// #777C6D  dark olive   — primary text, active fill
// #B7B89F  sage green   — accent, borders
// #CBCBCB  light grey   — input borders, dividers
// #EEEEEE  off-white    — page bg, card surface

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username,  setUsername]  = useState('admin')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await adminLogin(username, password)
      navigate('/admin')
    } catch {
      setError('Invalid admin credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EEEEEE] px-4 font-sans">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[440px] rounded-[2.5rem] border border-[#CBCBCB] bg-white p-10 shadow-[0_16px_48px_-12px_rgba(119,124,109,0.15)]"
      >
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B7B89F]">
            Yabera Suite
          </p>
          <h1 className="mt-3 font-serif text-[2.5rem] leading-tight text-[#777C6D]">
            Host login
          </h1>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {[
            { id: 'username', label: 'Username', type: 'text',     value: username, set: setUsername, ph: 'Enter your username' },
            { id: 'password', label: 'Password', type: 'password', value: password, set: setPassword, ph: 'Enter your password' },
          ].map(({ id, label, type, value, set, ph }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-[#777C6D]">
                {label}
              </label>
              <input
                id={id}
                type={type}
                required
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                className="mt-2 w-full rounded-2xl border border-[#CBCBCB] bg-[#FAFAFA] px-5 py-3.5 text-[#777C6D] outline-none transition-colors placeholder:text-[#CBCBCB] focus:border-[#B7B89F] focus:bg-white focus:ring-1 focus:ring-[#B7B89F]"
              />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            aria-live="polite"
            className="mt-4 rounded-xl border border-[#CBCBCB] bg-[#EEEEEE] px-4 py-3 text-sm text-[#777C6D]"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#777C6D] py-4 text-sm font-semibold text-white transition-all hover:bg-[#5E6355] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
          <Link
            to="/"
            className="block text-center text-sm text-[#B7B89F] transition-colors hover:text-[#777C6D]"
          >
            ← Back to site
          </Link>
        </div>
      </form>
    </div>
  )
}
