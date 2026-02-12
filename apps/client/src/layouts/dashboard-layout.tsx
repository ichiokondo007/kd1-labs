import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer, SidebarHeading } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Navbar } from '@/components/navbar'
import { 
  HomeIcon, 
  Square2StackIcon, 
  PencilSquareIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon, 
  DocumentTextIcon, 
  PresentationChartLineIcon
} from '@heroicons/react/20/solid'

export function DashboardLayout() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <div className="flex items-center gap-3">
             <img src="/kd.icon.svg" className="w-8 h-8" alt="KD1 Labs Logo" />
             <SidebarLabel>KD1 Labs</SidebarLabel>
          </div>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2 py-2">
              <img src="/kd.icon.svg" className="w-8 h-8" alt="KD1 Labs Logo" />
              <span className="text-lg font-bold text-zinc-950 dark:text-white">KD1 Labs</span>
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>Example</SidebarHeading>
              <SidebarItem href="/example/canvas" current={pathname.startsWith('/example/canvas')}>
                <PresentationChartLineIcon />
                <SidebarLabel>Canvas App</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/example/canvas-yjs" current={pathname === '/example/canvas-yjs'}>
                <Square2StackIcon />
                <SidebarLabel>Canvas Yjs App</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/example/form-yjs" current={pathname === '/example/form-yjs'}>
                <DocumentTextIcon />
                <SidebarLabel>Form Yjs App</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>Tech Blog</SidebarHeading>
              <SidebarItem href="/blog/public" current={pathname === '/blog/public'}>
                <PencilSquareIcon />
                <SidebarLabel>Public</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/private" current={pathname === '/blog/private'}>
                <PencilSquareIcon className="text-zinc-400" />
                <SidebarLabel>Private</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/sandbox" current={pathname === '/blog/sandbox'}>
                <Square2StackIcon />
                <SidebarLabel>Sandbox</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/settings" current={pathname === '/settings'}>
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/logout">
                <ArrowRightOnRectangleIcon />
                <SidebarLabel>Logout</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          
          <SidebarFooter className="max-lg:hidden">
             {/* 必要に応じてユーザー情報を表示 */}
             <div className="px-2 py-2 text-xs text-zinc-500">
                v0.1.0
             </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {/* ここに各ページの中身が表示されます */}
      <Outlet />
    </SidebarLayout>
  )
}
