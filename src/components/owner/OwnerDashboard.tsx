import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Zap, TrendingUp, Calendar, Users, IndianRupee, Battery, ArrowUpRight, Clock, MapPin } from 'lucide-react';

export default function OwnerDashboard() {
  const { state } = useApp();
  const ownerStations = state.stations.filter(s => s.ownerId === state.user?.id);
  const totalConnectors = ownerStations.reduce((s, st) => s + st.connectors.length, 0);
  const availableConnectors = ownerStations.reduce((s, st) => s + st.connectors.filter(c => c.status === 'available').length, 0);

  const totalEarnings = state.bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalBookings = state.bookings.length;

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, {state.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        {[
          { icon: IndianRupee, color: 'emerald', value: formatCurrency(totalEarnings), label: "Total Earnings", trend: '' },
          { icon: Calendar, color: 'blue', value: `${totalBookings}`, label: "Total Bookings", trend: '' },
          { icon: Zap, color: 'purple', value: `${ownerStations.length}`, label: 'Active Stations', trend: '' },
          { icon: Battery, color: 'amber', value: `${availableConnectors}/${totalConnectors}`, label: 'Available Ports', trend: '' },
        ].map(s => (
          <div key={s.label} className={`p-5 rounded-3xl card-3d ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center shadow-sm`}>
                <s.icon className={`w-6 h-6 text-${s.color}-500`} />
              </div>
              {s.trend && <span className="flex items-center text-xs font-bold text-emerald-500 badge-3d bg-emerald-500/10 px-2 py-1 rounded-lg"><ArrowUpRight className="w-3 h-3 mr-0.5" />{s.trend}</span>}
            </div>
            <div className="text-3xl font-black">{s.value}</div>
            <div className={`text-xs font-bold mt-1 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings chart */}
        <div className={`lg:col-span-2 rounded-3xl p-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl">Revenue Overview</h2>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6 stagger">
            {[['Total Revenue', formatCurrency(totalEarnings)], ['Active Stations', ownerStations.length], ['Total Sessions', totalBookings]].map(([l, v]) => (
              <div key={l as string} className={`p-3.5 rounded-2xl ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{l as string}</div>
                <div className="text-xl font-black text-emerald-500">{v as string | number}</div>
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="flex items-end gap-3 h-36">
            {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full gradient-purple rounded-xl transition-all duration-500 hover:opacity-80 shadow-md shadow-purple-500/10" style={{ height: `${h}%` }} />
                <span className={`text-[10px] font-bold ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Station Performance */}
        <div className={`rounded-3xl p-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
          <h2 className="font-bold text-xl mb-4">Station Health</h2>
          <div className="space-y-3.5">
            {ownerStations.slice(0, 4).map(station => {
              const av = station.connectors.filter(c => c.status === 'available').length;
              const tot = station.connectors.length;
              const occ = Math.round(((tot - av) / tot) * 100);
              return (
                <div key={station.id} className={`p-3.5 rounded-2xl ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm truncate flex-1">{station.name}</h4>
                    <span className="text-xs font-black text-emerald-500">{occ}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    <div className="h-full gradient-green rounded-full transition-all shadow-sm" style={{ width: `${occ}%` }} />
                  </div>
                  <div className={`text-[11px] mt-1.5 font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{tot - av}/{tot} ports in use</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className={`mt-6 rounded-3xl p-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-xl">Recent Bookings</h2><Users className="w-5 h-5 text-gray-400" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className={`border-b ${state.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {['Customer', 'Station', 'Time', 'Status', 'Amount'].map(h => <th key={h} className={`${h === 'Amount' ? 'text-right' : 'text-left'} py-3 px-2 font-bold text-xs uppercase tracking-wider ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {state.bookings.slice(0, 5).map(b => (
                <tr key={b.id} className={`border-b ${state.darkMode ? 'border-gray-700/30' : 'border-gray-100'}`}>
                  <td className="py-3.5 px-2"><div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center text-white text-xs font-black shadow-sm">{(b as any).userName?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <span className="font-medium">{(b as any).userName || 'Unknown'}</span>
                  </div></td>
                  <td className="py-3.5 px-2"><div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" /><span className="truncate max-w-[120px] font-medium">{b.stationName}</span></div></td>
                  <td className="py-3.5 px-2"><div className="flex items-center gap-1.5 font-medium"><Clock className="w-3 h-3 text-gray-400" />{b.startTime}</div></td>
                  <td className="py-3.5 px-2"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize badge-3d
                    ${b.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' : b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : b.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>{b.status}</span></td>
                  <td className="py-3.5 px-2 text-right font-black text-emerald-500">{formatCurrency(b.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
