import * as Headless from '@headlessui/react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer, SidebarHeading } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Navbar, NavbarSpacer } from '@/components/navbar'
import { Avatar } from '@/components/avatar'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel } from '@/components/dropdown'
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
  UsersIcon,
} from '@heroicons/react/20/solid'

/** avatarColor が Tailwind 名のときの背景クラス（purge 用に明示）。hex の場合はインライン style を使用する */
const AVATAR_BG: Record<string, string> = {
  'zinc-900': 'bg-zinc-900 text-white',
  'zinc-800': 'bg-zinc-800 text-white',
  'blue-600': 'bg-blue-600 text-white',
  'indigo-600': 'bg-indigo-600 text-white',
}

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value)
}

function nameToInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function SidebarUser({ user }: { user: User }) {
  const displayName = user.screenName || user.userName
  const initials = nameToInitials(displayName)
  const useHex = isHexColor(user.avatarColor)
  const bgClass = useHex ? undefined : (AVATAR_BG[user.avatarColor] ?? AVATAR_BG['zinc-900'])
  const bgStyle = useHex ? { backgroundColor: user.avatarColor } : undefined
  return (
    <div className="flex min-w-0 items-center gap-3 px-2 py-2">
      {user.avatarUrl ? (
        <Avatar src={user.avatarUrl} alt={displayName} className="size-9 shrink-0" />
      ) : (
        <span
          className={bgClass ? `inline-flex size-9 shrink-0 items-center justify-center rounded-full ${bgClass} text-xs font-medium` : 'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white'}
          style={bgStyle}
        >
          <Avatar initials={initials} alt={displayName} className="size-9" />
        </span>
      )}
      <span className="min-w-0 truncate text-sm text-zinc-600 dark:text-zinc-400">
        {displayName}
      </span>
    </div>
  )
}

/** モバイル用: ナビバー右のアバター＋Settings/Logout ドロップダウン */
function NavbarAvatarMenu({ user }: { user: User }) {
  const displayName = user.screenName || user.userName
  const initials = nameToInitials(displayName)
  const useHex = isHexColor(user.avatarColor)
  const bgClass = useHex ? undefined : (AVATAR_BG[user.avatarColor] ?? AVATAR_BG['zinc-900'])
  const bgStyle = useHex ? { backgroundColor: user.avatarColor } : undefined
  return (
    <Dropdown>
      <DropdownButton
        as={Headless.Button}
        className="rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label="Open user menu"
      >
        {user.avatarUrl ? (
          <Avatar src={user.avatarUrl} alt={displayName} className="size-9" />
        ) : (
          <span
            className={bgClass ? `inline-flex size-9 items-center justify-center rounded-full ${bgClass} text-xs font-medium` : 'inline-flex size-9 items-center justify-center rounded-full text-xs font-medium text-white'}
            style={bgStyle}
          >
            <Avatar initials={initials} alt={displayName} className="size-9" />
          </span>
        )}
      </DropdownButton>
      <DropdownMenu anchor="bottom end">
        <DropdownItem href="/user-management" to="/user-management">
          <UsersIcon data-slot="icon" />
          <DropdownLabel>User management</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/settings" to="/settings">
          <Cog6ToothIcon data-slot="icon" />
          <DropdownLabel>Settings</DropdownLabel>
        </DropdownItem>
        <DropdownItem href="/logout" to="/logout">
          <ArrowRightOnRectangleIcon data-slot="icon" />
          <DropdownLabel>Logout</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
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
          <NavbarSpacer />
          {!isLoading && user && <NavbarAvatarMenu user={user} />}
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
              <SidebarItem href="/home" to="/home" current={pathname === '/home'}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>Example</SidebarHeading>
              <SidebarItem href="/example/canvas" to="/example/canvas" current={pathname.startsWith('/example/canvas')}>
                <PresentationChartLineIcon />
                <SidebarLabel>Canvas App</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/example/canvas-yjs" to="/example/canvas-yjs" current={pathname === '/example/canvas-yjs'}>
                <Square2StackIcon />
                <SidebarLabel>Canvas Yjs App</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/example/form-yjs" to="/example/form-yjs" current={pathname === '/example/form-yjs'}>
                <DocumentTextIcon />
                <SidebarLabel>Form Yjs App</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>Tech Blog</SidebarHeading>
              <SidebarItem href="/blog/public" to="/blog/public" current={pathname === '/blog/public'}>
                <PencilSquareIcon />
                <SidebarLabel>Public</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/private" to="/blog/private" current={pathname === '/blog/private'}>
                <PencilSquareIcon className="text-zinc-400" />
                <SidebarLabel>Private</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/blog/sandbox" to="/blog/sandbox" current={pathname === '/blog/sandbox'}>
                <Square2StackIcon />
                <SidebarLabel>Sandbox</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/user-management" to="/user-management" current={pathname === '/user-management'}>
                <UsersIcon />
                <SidebarLabel>User management</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" to="/settings" current={pathname === '/settings'}>
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/logout" to="/logout">
                <ArrowRightOnRectangleIcon />
                <SidebarLabel>Logout</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            {!isLoading && user && <SidebarUser user={user} />}
            <div className="px-2 py-1 text-xs text-zinc-500">
              v1.0.0
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
