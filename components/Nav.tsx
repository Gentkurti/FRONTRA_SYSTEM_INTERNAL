'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function Nav() {
  const pathname = usePathname()

  const links = [
    { href: '/checklist', label: 'Checklista' },
    { href: '/kalender', label: 'Kalender' },
    { href: '/schema', label: 'Schema' },
    { href: '/mal', label: 'Mål' },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-3xl mx-auto px-5 flex items-center justify-between h-14">
        <div className="flex gap-8">
          <Link
            href="/checklist"
            className="text-slate-700 font-semibold tracking-tight hover:text-slate-900 transition-colors"
          >
            Frontra
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          Logga ut
        </button>
      </div>
    </nav>
  )
}
