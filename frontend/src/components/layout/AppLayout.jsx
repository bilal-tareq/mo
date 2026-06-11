import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppTopbar from './AppTopbar'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <AppSidebar />
      <AppTopbar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
