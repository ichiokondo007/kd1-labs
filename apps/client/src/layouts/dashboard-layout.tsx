import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer, SidebarHeading } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Navbar } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import type { User } from '@kd1-labs/types'
import {
  HomeIcon,
  Square2StackIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/20/solid'

/** avatarColor を Tailwind の背景クラスに変換（purge 用に明示） */
const AVATAR_BG: Record<string, string> = {
  'zinc-900': 'bg-zinc-900 text-white',
  'zinc-800': 'bg-zinc-800 text-white',
  'blue-600': 'bg-blue-600 text-white',
  'indigo-600': 'bg-indigo-600 text-white',
}

function userNameToInitials(userName: string): string {
  const trimmed = userName.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function SidebarUser({ user }: { user: User }) {
  const initials = userNameToInitials(user.userName)
  const bgClass = AVATAR_BG[user.avatarColor] ?? AVATAR_BG['zinc-900']
  return (
    <div className="flex min-w-0 items-center gap-3 px-2 py-2">
      {user.avatarUrl ? (
        <Avatar src={user.avatarUrl} alt={user.userName} className="size-9 shrink-0" />
      ) : (
        <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${bgClass} text-xs font-medium`}>
          <Avatar initials={initials} alt={user.userName} className="size-9" />
        </span>
      )}
      <span className="min-w-0 truncate text-sm text-zinc-600 dark:text-zinc-400">
        {user.userName}
      </span>
    </div>
  )
}

export function DashboardLayout() {
  const location = useLocation()
  const pathname = location.pathname
  const { user, isLoading } = useCurrentUser()

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <img src="/kd1.png" className="h-10 w-auto" alt="KD1 Labs Logo" />
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-2 py-2">
              <img src="/kd1.png" className="h-10 w-auto" alt="KD1 Labs Logo" />
            </div>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/home" current={pathname === '/home'}>
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
            {!isLoading && user && <SidebarUser user={user} />}
            <div className="px-2 py-1 text-xs text-zinc-500">
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
