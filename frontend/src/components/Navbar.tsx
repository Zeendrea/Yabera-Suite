import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { href: '/#about', label: 'About' },
  { href: '/#nearby', label: 'Nearby' },
  { href: '/#amenities', label: 'Amenities' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#location', label: 'Location' },
  { href: '/#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const home = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl text-ink-900">
          Yabera Suite
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
          <Link to="/" className={home ? 'text-ink-900' : ''}>
            Home
          </Link>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink-900">
              {link.label}
            </a>
          ))}
          <Link
            to="/book"
            className="rounded-full bg-ink-900 px-5 py-2 text-white shadow-card hover:bg-ink-800"
          >
            Book Now
          </Link>
        </nav>
        <button
          className="rounded-full p-2 text-ink-800 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-sand-200 bg-sand-50 px-4 py-4 md:hidden">
          <Link to="/" className="block" onClick={() => setOpen(false)}>
            Home
          </Link>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="block" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <Link
            to="/book"
            onClick={() => setOpen(false)}
            className="block rounded-full bg-ink-900 px-5 py-3 text-center text-white"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  )
}
