import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, Users, LogOut, Package, BookOpen } from 'lucide-react'

export function AdminLayout() {
  const location = useLocation()

  const navItems = [
    { name: 'Dispatch Board', path: '/admin', icon: LayoutDashboard },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Ledger', path: '/admin/ledger', icon: BookOpen },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10 relative">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center">
            <span className="text-indigo-500 mr-2">OMNI</span>
            <span className="font-light text-slate-400 text-lg">PRO</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200">
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
