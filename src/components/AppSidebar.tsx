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
import { Home, User, GalleryVerticalEnd } from 'lucide-react'
import { NavUser } from '@/components/NavUser'
import { NavMain } from '@/components/NavMain'
import { useLocation } from 'react-router-dom'

const navItems = [
  {
    title: 'Feed',
    url: '/feed',
    icon: Home,
  },
  {
    title: 'Profile',
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
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">PoliChan</span>
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
