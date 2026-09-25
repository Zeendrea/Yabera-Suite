import { Link } from 'react-router-dom'

export default function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-sand-50/95 p-3 backdrop-blur md:hidden">
      <Link
        to="/book"
        className="block rounded-full bg-ink-900 py-3 text-center text-sm font-semibold text-white"
      >
        Check Availability
      </Link>
    </div>
  )
}
