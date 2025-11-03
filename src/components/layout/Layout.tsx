import type { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

const pageTitles: Record<string, string> = {
  '/feed': 'Feed',
  '/profile': 'Profile',
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'PoliChan'

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex-1 w-full">
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-10 bg-background border-b">
            <div className="flex items-center gap-4 p-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto w-full px-6">{children}</div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
