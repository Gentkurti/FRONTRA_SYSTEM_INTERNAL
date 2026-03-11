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
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex gap-6">
          <Link
            href="/checklist"
            className="text-slate-600 font-medium hover:text-slate-900"
          >
            Frontra
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium ${
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Logga ut
        </button>
      </div>
    </nav>
  )
}
