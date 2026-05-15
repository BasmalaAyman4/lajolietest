import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider } from '@/hooks/useSidebar'

import { useSidebar } from '@/hooks/useSidebar'

function LayoutContent() {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()
  const isOpen = isExpanded || isHovered || isMobileOpen

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Spacer matching sidebar width */}
      <div style={{ width: isOpen ? 250 : 72, flexShrink: 0, transition: "width 0.3s ease" }} />
      
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  )
}