import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Home, User } from 'lucide-react'
import { NavUser } from './NavUser'
import { NavMain } from './NavMain'
import { useLocation } from 'react-router-dom'
import logo from '@/assets/ipf-logo.png'

const navItems = [
  {
    title: 'Inicio',
    url: '/feed',
    icon: Home,
  },
  {
    title: 'Perfil',
    url: '/profile',
    icon: User,
  },
]

export function AppSidebar() {
  const location = useLocation()

  const itemsWithActive = navItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.url,
  }))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="cursor-default">
                <div className="  text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src={logo} alt="" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Poli-Chan</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={itemsWithActive} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
