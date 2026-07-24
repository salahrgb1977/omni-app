import { DollarSign, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'

// Dummy Data
const WEEKLY_EARNINGS = 850.50
const COMPLETED_JOBS = 12

export function WorkerEarnings() {
  return (
    <div className="p-4 bg-slate-50 min-h-full">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h1>
      
      <div className="bg-blue-600 text-white rounded-2xl p-6 mb-6 shadow-md bg-gradient-to-br from-blue-600 to-indigo-700">
        <h2 className="text-blue-100 text-sm font-medium mb-1">This Week</h2>
        <div className="text-4xl font-bold flex items-baseline">
          <span className="text-2xl mr-1">$</span>
          {WEEKLY_EARNINGS.toFixed(2)}
        </div>
        <div className="mt-4 flex items-center text-blue-100 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-lg">
          <TrendingUp size={16} className="mr-2" />
          <span>+15% from last week</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 flex items-center">
            <DollarSign size={16} className="mr-1" />
            <span>Avg / Job</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${(WEEKLY_EARNINGS / COMPLETED_JOBS).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1 flex items-center">
            <CalendarIcon size={16} className="mr-1" />
            <span>Completed</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {COMPLETED_JOBS} Jobs
          </div>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-4">Recent Payouts</h3>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Job #{1000 + i}</p>
              <p className="text-sm text-slate-500">Oct {15 - i}, 2023</p>
            </div>
            <div className="font-bold text-green-600">
              +$75.00
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
