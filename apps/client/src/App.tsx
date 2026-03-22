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
import CanvasEditorPage from '@/pages/example/canvas-editor'
import { SvglibraryPage } from '@/features/svglibrary'
import NotFoundPage from '@/pages/404'
import ComingSoonPage from '@/pages/coming-soon'
import CanvasYjsListPage from '@/pages/example/canvas-yjs-list'
import CanvasYjsEditorPage from '@/pages/example/canvas-yjs-editor'
import BlogPublicPageEntry from '@/pages/blog-public'
import BlogPublicDetailPage from '@/pages/blog-public-detail'
import YjsMetricsPage from '@/pages/yjs-metrics'

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
            <Route path="/example/canvas/new" element={<CanvasEditorPage />} />
            <Route path="/example/canvas/:id" element={<CanvasEditorPage />} />
            <Route path="/svg-assets" element={<SvglibraryPage />} />
            <Route path="/example/canvas-yjs" element={<CanvasYjsListPage />} />
            <Route path="/example/canvas-yjs/:id" element={<CanvasYjsEditorPage />} />
            <Route path="/example/form-yjs" element={<ComingSoonPage />} />
            <Route path="/yjs-metrics" element={<YjsMetricsPage />} />

            {/* Tech Blog Routes */}
            <Route path="/blog/public" element={<BlogPublicPageEntry />} />
            <Route path="/blog/public/:slug" element={<BlogPublicDetailPage />} />
            <Route path="/blog/private" element={<ComingSoonPage />} />
            <Route path="/blog/sandbox" element={<ComingSoonPage />} />

            {/* User management */}
            <Route path="/user-management" element={<UserManagementPageEntry />} />
            {/* Settings */}
            <Route path="/settings" element={<SettingsPageEntry />} />

            {/* 未定義ルート → 404 */}
            <Route path="*" element={<NotFoundPage />} />
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
