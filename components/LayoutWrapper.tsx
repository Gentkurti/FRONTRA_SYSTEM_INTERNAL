'use client'

import { usePathname } from 'next/navigation'
import { Nav } from './Nav'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Nav />
      <main>{children}</main>
    </div>
  )
}
