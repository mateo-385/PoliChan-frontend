import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar/AppSidebar'
import { useLocation } from 'react-router-dom'
import { useSidebar } from '@/hooks/use-sidebar'

interface LayoutProps {
  children: ReactNode
}

const pageTitles: Record<string, string> = {
  '/feed': 'Inicio',
  '/profile': 'Perfil',
}

function LayoutContent({ children }: LayoutProps) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'PoliChan'
  const { setOpenMobile, isMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile])

  return (
    <main className="flex-1 w-full">
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-4 p-4">
            <SidebarTrigger className="md:hidden" size={'lg'} />
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div
            className={
              isMobile
                ? 'max-w-3xl mx-auto w-full px-3'
                : 'max-w-3xl mx-auto w-full px-6'
            }
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}
