import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import PasswordChangePage from '@/pages/onboarding/password-change'
import CanvasListPage from '@/pages/example/canvas-list'

// プレースホルダー用コンポーネント（まだ作っていないページ用）
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="mt-2 text-zinc-500">This page is under construction.</p>
  </div>
)

// ローディング表示
function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-zinc-500">Loading...</p>
    </div>
  )
}

// 認証済みユーザーのみアクセス可。初期パスワードの場合はパスワード変更画面へリダイレクト
function RequireAuth() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.isInitialPassword) return <Navigate to="/onboarding/password-change" replace />
  return <Outlet />
}

// 初期パスワード変更が必要なユーザーのみアクセス可
function RequireInitialPassword() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!user.isInitialPassword) return <Navigate to="/" replace />
  return <Outlet />
}

// 未認証ユーザーのみアクセス可（ログイン画面用）
function GuestOnly() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (user && user.isInitialPassword) return <Navigate to="/onboarding/password-change" replace />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 未認証ユーザー向けルート */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* オンボーディング（初期パスワード変更） */}
          <Route element={<RequireInitialPassword />}>
            <Route path="/onboarding/password-change" element={<PasswordChangePage />} />
          </Route>

          {/* 認証済みユーザー向け：サイドバーレイアウト */}
          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<HomePage />} />

              {/* Example Routes */}
              <Route path="/example/canvas" element={<CanvasListPage />} />
              <Route path="/example/canvas-yjs" element={<Placeholder title="Canvas Yjs App" />} />
              <Route path="/example/form-yjs" element={<Placeholder title="Form Yjs App" />} />

              {/* Tech Blog Routes */}
              <Route path="/blog/public" element={<Placeholder title="Public Blog" />} />
              <Route path="/blog/private" element={<Placeholder title="Private Blog" />} />
              <Route path="/blog/sandbox" element={<Placeholder title="Sandbox" />} />

              {/* Settings */}
              <Route path="/settings" element={<Placeholder title="Settings" />} />
            </Route>
          </Route>

          {/* その他 */}
          <Route path="/logout" element={<Placeholder title="Logging out..." />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
