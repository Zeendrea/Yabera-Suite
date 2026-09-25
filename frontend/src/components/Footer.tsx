import { Link } from 'react-router-dom'
import { PROPERTY } from '../content'

export default function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-2xl text-ink-900">Yabera Suite</p>
          <p className="mt-2 max-w-sm text-sm text-ink-700">{PROPERTY.address}</p>
        </div>
        <div className="flex gap-8 text-sm">
          <Link to="/" className="hover:text-ink-900">
            Home
          </Link>
          <Link to="/book" className="hover:text-ink-900">
            Book
          </Link>
          <Link to="/admin/login" className="hover:text-ink-900">
            Host login
          </Link>
        </div>
      </div>
    </footer>
  )
}
