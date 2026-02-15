import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import HomePage from '@/pages/home'
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
        {/* サイドバーレイアウトを適用するルート群 */}
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
        
        {/* ログイン画面などはレイアウトの外に定義します（後ほど実装） */}
        <Route path="/logout" element={<Placeholder title="Logging out..." />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
