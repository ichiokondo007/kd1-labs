import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import HomePage from '@/pages/home'
import LoginPageEntry from '@/pages/login'
import CanvasListPage from '@/pages/example/canvas-list'

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
      <Routes>
        {/* 認証画面（レイアウト外） */}
        <Route path="/login" element={<LoginPageEntry />} />

        {/* セッションありのみ表示。なしなら /login へ */}
        <Route element={<ProtectedRoute />}>
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

          {/* Settings */}
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Route>

        <Route path="/password-change" element={<Placeholder title="Password Change" />} />
        <Route path="/logout" element={<Placeholder title="Logging out..." />} />

        {/* ルート（/）はログイン画面へリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
