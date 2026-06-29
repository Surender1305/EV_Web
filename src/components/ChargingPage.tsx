import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { Zap, Battery, Clock, DollarSign, StopCircle } from 'lucide-react';

export default function ChargingPage() {
  const { state, dispatch } = useApp();
  const session = state.activeChargingSession;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const booking = session ? state.bookings.find(b => b.id === session.bookingId) : null;
  const station = booking ? state.stations.find(s => s.id === booking.stationId) : null;
  const connector = station ? station.connectors.find(c => c.id === booking?.connectorId) : null;

  useEffect(() => {
    if (!session?.isActive || !connector) return;
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'UPDATE_CHARGING', payload: {
        energyDelivered: Math.round((session.energyDelivered + connector.powerKw / 3600) * 100) / 100,
        elapsed: session.elapsed + 1,
        cost: Math.round(((session.energyDelivered + connector.powerKw / 3600) * (station?.pricePerKwh || 14)) * 100) / 100,
      }});
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session?.isActive, session?.energyDelivered, session?.elapsed]);

  const handleStopCharging = async () => {
    if (!session) return;
    try {
      const response = await api.stopCharging(session.bookingId, { energyDelivered: session.energyDelivered, cost: session.cost });
      dispatch({ type: 'STOP_CHARGING', payload: { energyDelivered: session.energyDelivered, cost: session.cost } });
      if (response.user) {
        dispatch({ type: 'UPDATE_USER', payload: { walletBalance: response.user.walletBalance } });
      }
      // Refresh stations to get updated connector status
      try {
        const stations = await api.getStations();
        dispatch({ type: 'SET_STATIONS', payload: stations as any });
      } catch {}
    } catch (err: any) { alert(err.message); }
  };

  if (!session || !booking) {
    return (
      <div className="p-4 pb-24 md:pb-8 max-w-lg mx-auto text-center py-24 animate-slide-up">
        <div className="w-24 h-24 rounded-3xl bg-gray-200/50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-5">
          <Zap className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black mb-2">No Active Session</h2>
        <p className={`${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start a charging session from your bookings</p>
      </div>
    );
  }

  const elMin = Math.floor(session.elapsed / 60);
  const elSec = session.elapsed % 60;
  const maxEnergy = connector ? connector.powerKw : 100;
  const progress = Math.min((session.energyDelivered / maxEnergy) * 100, 100);

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-lg mx-auto animate-slide-up">
      <h2 className="text-3xl font-black mb-6 text-center">Live Charging</h2>

      <div className={`rounded-3xl p-5 mb-6 surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
        <h3 className="font-bold">{booking.stationName}</h3>
        <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{booking.connectorType} · {connector?.powerKw} kW</p>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-8">
        <div className="relative w-60 h-60">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r="85" fill="none" stroke={state.darkMode ? '#1f2937' : '#f3f4f6'} strokeWidth="10" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`} strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
              className="transition-all duration-1000" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }} />
            <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#06B6D4" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Zap className="w-8 h-8 text-emerald-500 mb-1 animate-pulse" />
            <span className="text-4xl font-black">{session.energyDelivered.toFixed(1)}</span>
            <span className={`text-sm font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>kWh</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 stagger">
        {[
          { icon: Clock, color: 'blue', val: `${elMin}:${elSec.toString().padStart(2, '0')}`, label: 'Elapsed' },
          { icon: Battery, color: 'emerald', val: `${Math.round(progress)}%`, label: 'Progress' },
          { icon: DollarSign, color: 'amber', val: formatCurrency(session.cost), label: 'Cost' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl text-center card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <s.icon className={`w-5 h-5 text-${s.color}-500 mx-auto mb-2`} />
            <div className="text-xl font-black">{s.val}</div>
            <div className={`text-xs font-bold ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-4 mb-6 ${state.darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
        <div className="flex justify-between text-sm"><span className={state.darkMode ? 'text-gray-400' : 'text-gray-600'}>Rate</span><span className="font-bold text-emerald-600">{connector?.powerKw} kW</span></div>
        <div className="flex justify-between text-sm mt-2"><span className={state.darkMode ? 'text-gray-400' : 'text-gray-600'}>Price</span><span className="font-bold">{formatCurrency(station?.pricePerKwh || 0)}/kWh</span></div>
      </div>

      <button onClick={handleStopCharging}
        className="w-full flex items-center justify-center gap-2 py-5 rounded-3xl bg-red-500 text-white font-black text-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:bg-red-600 transition-all">
        <StopCircle className="w-7 h-7" />Stop Charging
      </button>
    </div>
  );
}
