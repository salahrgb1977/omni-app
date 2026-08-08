import { Outlet, NavLink } from 'react-router-dom'
import { Briefcase, Package, User, DollarSign } from 'lucide-react'

export function WorkerLayout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full glass-nav flex justify-around items-center h-20 max-w-md mx-auto px-2">
        <NavLink 
          to="/worker" 
          end
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <Briefcase size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Jobs</span>
        </NavLink>
        <NavLink 
          to="/worker/equipment" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <Package size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Vault</span>
        </NavLink>
        <NavLink 
          to="/worker/earnings" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <DollarSign size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Pay</span>
        </NavLink>
        <NavLink 
          to="/worker/profile" 
          className={({isActive}) => `flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ width: '64px', height: '64px' }}
        >
          <User size={22} className="mb-1" />
          <span className="text-[10px] font-semibold">Profile</span>
        </NavLink>
      </nav>
    </div>
  )
}
