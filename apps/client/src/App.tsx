import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GlobalLoading } from '@/components/global-loading'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import LoginPageEntry from '@/pages/login'
import LogoutPage from '@/pages/logout'
import NotFoundPage from '@/pages/404'
import ComingSoonPage from '@/pages/coming-soon'

// Route-level code splitting
const HomePage = lazy(() => import('@/pages/home'))
const PasswordChangePageEntry = lazy(() => import('@/pages/password-change'))
const CanvasListPage = lazy(() => import('@/pages/example/canvas-list'))
const CanvasEditorPage = lazy(() => import('@/pages/example/canvas-editor'))
const CanvasYjsListPage = lazy(() => import('@/pages/example/canvas-yjs-list'))
const CanvasYjsEditorPage = lazy(() => import('@/pages/example/canvas-yjs-editor'))
const SvglibraryPage = lazy(() => import('@/features/svglibrary').then(m => ({ default: m.SvglibraryPage })))
const BlogPublicPageEntry = lazy(() => import('@/pages/blog-public'))
const BlogPublicDetailPage = lazy(() => import('@/pages/blog-public-detail'))
const YjsMetricsPage = lazy(() => import('@/pages/yjs-metrics'))
const SettingsPageEntry = lazy(() => import('@/pages/settings'))
const UserManagementPageEntry = lazy(() => import('@/pages/user-management'))

function App() {
  return (
    <BrowserRouter>
      <GlobalLoading />
      <Suspense fallback={<GlobalLoading />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
