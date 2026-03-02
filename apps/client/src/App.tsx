import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GlobalLoading } from '@/components/global-loading'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import HomePage from '@/pages/home'
import LoginPageEntry from '@/pages/login'
import PasswordChangePageEntry from '@/pages/password-change'
import CanvasListPage from '@/pages/example/canvas-list'
import SettingsPageEntry from '@/pages/settings'
import UserManagementPageEntry from '@/pages/user-management'
import LogoutPage from '@/pages/logout'

// プレースホルダー用コンポーネント（まだ作っていないページ用）
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="mt-2 text-zinc-500">This page is under construction.</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Routes>
        {/* 認証画面（レイアウト外） */}
        <Route path="/login" element={<LoginPageEntry />} />

        {/* セッションありのみ表示。なしなら /login へ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/password-change" element={<PasswordChangePageEntry />} />
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<HomePage />} />

          {/* Example Routes */}
          <Route path="/example/canvas" element={<CanvasListPage />} />
          <Route path="/example/canvas-yjs" element={<Placeholder title="Canvas Yjs App" />} />
          <Route path="/example/form-yjs" element={<Placeholder title="Form Yjs App" />} />

          {/* Tech Blog Routes */}
          <Route path="/blog/public" element={<Placeholder title="Public Blog" />} />
          <Route path="/blog/private" element={<Placeholder title="Private Blog" />} />
          <Route path="/blog/sandbox" element={<Placeholder title="Sandbox" />} />

          {/* User management */}
          <Route path="/user-management" element={<UserManagementPageEntry />} />
          {/* Settings */}
          <Route path="/settings" element={<SettingsPageEntry />} />
          </Route>
        </Route>

        <Route path="/logout" element={<LogoutPage />} />

        {/* ルート（/）はログイン画面へリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
