import { Outlet, NavLink } from 'react-router-dom'
import { Briefcase, DollarSign, User, Package } from 'lucide-react'

export function WorkerLayout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 max-w-md mx-auto">
        <NavLink 
          to="/worker" 
          end
          className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <Briefcase size={24} />
          <span className="text-[10px] mt-1 font-medium">Jobs</span>
        </NavLink>
        <NavLink 
          to="/worker/equipment" 
          className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <Package size={24} />
          <span className="text-[10px] mt-1 font-medium">Equipment</span>
        </NavLink>
        <NavLink 
          to="/worker/earnings" 
          className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <DollarSign size={24} />
          <span className="text-[10px] mt-1 font-medium">Earnings</span>
        </NavLink>
        <NavLink 
          to="/worker/profile" 
          className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </NavLink>
      </nav>
    </div>
  )
}
