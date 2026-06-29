import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { IndianRupee, ArrowUpRight, Download, Calendar, Building2, CreditCard } from 'lucide-react';

export default function OwnerEarnings() {
  const { state } = useApp();
  const ownerStations = state.stations.filter(s => s.ownerId === state.user?.id);
  const earningsByStation = ownerStations.map(s => {
    const stBookings = state.bookings.filter(b => b.stationId === s.id);
    return {
      name: s.name,
      earnings: stBookings.reduce((acc, b) => acc + (b.amount || 0), 0),
      sessions: stBookings.length
    };
  }).filter(s => s.sessions > 0);
  
  const totalEarnings = earningsByStation.reduce((acc, s) => acc + s.earnings, 0);
  const totalBookings = state.bookings.length;

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div><h1 className="text-3xl font-black">Earnings</h1><p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track revenue & payouts</p></div>
        <button className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold transition surface-raised ${state.darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}><Download className="w-4 h-4" />Export</button>
      </div>

      {/* Balance */}
      <div className="rounded-3xl gradient-purple p-7 text-white mb-6 relative overflow-hidden animate-scale-in surface-floating">
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 blur-xl" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 blur-xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/60 mb-1"><IndianRupee className="w-4 h-4" /><span className="text-sm font-semibold">Total Earnings</span></div>
          <div className="text-5xl font-black mb-2">{formatCurrency(totalEarnings)}</div>
          <div className="flex items-center gap-1 text-emerald-300 text-sm font-bold"><ArrowUpRight className="w-4 h-4" />Live Total Earnings</div>
          <div className="flex gap-6 mt-6">
            <div><div className="text-xs text-white/50 font-medium">Active Stations</div><div className="text-xl font-bold">{ownerStations.length}</div></div>
            <div><div className="text-xs text-white/50 font-medium">Total Sessions</div><div className="text-xl font-bold">{totalBookings}</div></div>
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 stagger">
        {[['Total Revenue', totalEarnings], ['Total Bookings', totalBookings]].map(([l, v]) => (
          <div key={l as string} className={`p-5 rounded-3xl card-3d ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className={`text-sm font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{l as string}</div>
            <div className="text-2xl font-black mt-1">{l === 'Total Revenue' ? formatCurrency(v as number) : v as number}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Station */}
        <div className={`rounded-3xl p-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
          <div className="flex items-center justify-between mb-5"><h2 className="font-bold text-xl">By Station</h2><Building2 className="w-5 h-5 text-gray-400" /></div>
          <div className="space-y-4">
            {earningsByStation.length === 0 ? (
              <div className="text-center py-4 text-sm font-medium text-gray-500">No earnings yet</div>
            ) : earningsByStation.map((s, i) => {
              const maxE = Math.max(...earningsByStation.map(x => x.earnings));
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold truncate flex-1">{s.name}</span><span className="text-sm font-black text-emerald-500">{formatCurrency(s.earnings)}</span></div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"><div className="h-full gradient-purple rounded-full shadow-sm" style={{ width: `${(s.earnings / maxE) * 100}%` }} /></div>
                  <div className={`text-xs mt-1 font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.sessions} sessions</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payouts */}
        <div className={`rounded-3xl p-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
          <div className="flex items-center justify-between mb-5"><h2 className="font-bold text-xl">Recent Payouts</h2><CreditCard className="w-5 h-5 text-gray-400" /></div>
          <div className="space-y-3">
            {state.transactions.filter(t => t.type === 'top-up').map(txn => (
              <div key={txn.id} className={`flex items-center gap-3.5 p-3.5 rounded-2xl ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-emerald-500" /></div>
                <div className="flex-1"><p className="font-bold text-sm">{txn.description}</p><p className={`text-xs font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(txn.createdAt)}</p></div>
                <span className="font-black text-emerald-500">+{formatCurrency(txn.amount)}</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3.5 rounded-2xl border ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1.5"><Calendar className="w-4 h-4 text-purple-500" /><span className="text-sm font-bold">Payout Schedule</span></div>
            <p className={`text-xs font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payouts every Friday. Min ₹1,000.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
