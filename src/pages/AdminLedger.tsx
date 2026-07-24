import { TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react'

// Dummy Data
const MOCK_TRANSACTIONS = [
  { id: 'tx-1', job_id: '1001', type: 'income', amount: 150.00, category: 'Service Fee', date: '2023-10-15T09:30:00Z' },
  { id: 'tx-2', job_id: '1001', type: 'expense', amount: 45.00, category: 'worker_pay', date: '2023-10-15T09:35:00Z' },
  { id: 'tx-3', job_id: null, type: 'expense', amount: 200.00, category: 'freon_restock', date: '2023-10-14T14:00:00Z' },
  { id: 'tx-4', job_id: '1000', type: 'income', amount: 350.00, category: 'Installation', date: '2023-10-13T11:00:00Z' },
]

export function AdminLedger() {
  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Ledger</h1>
          <p className="text-slate-500 mt-1">Track income, expenses, and net profit for the month.</p>
        </div>
        <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-slate-500 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <DollarSign size={24} />
            </div>
            <span className="font-medium">Total Income</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">${totalIncome.toFixed(2)}</div>
          <div className="text-sm text-green-600 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-slate-500 mb-4">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <TrendingDown size={24} />
            </div>
            <span className="font-medium">Total Expenses</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">${totalExpenses.toFixed(2)}</div>
          <div className="text-sm text-red-600 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+5% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-slate-500 mb-4">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
            <span className="font-medium">Net Profit</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">${netProfit.toFixed(2)}</div>
          <div className="text-sm text-green-600 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+18% from last month</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Related Job ID</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-700">
                  {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 text-slate-900 font-medium capitalize">{tx.category.replace('_', ' ')}</td>
                <td className="p-4 text-slate-500">{tx.job_id ? `#${tx.job_id}` : '-'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.type.toUpperCase()}
                  </span>
                </td>
                <td className={`p-4 text-right font-bold ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
