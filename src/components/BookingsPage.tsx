import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { formatCurrency, formatTime, getStatusColor, formatDate } from '../utils/helpers';
import { Calendar, Clock, Zap, QrCode, ChevronDown, ChevronUp, XCircle, PlayCircle, Battery } from 'lucide-react';
import QRCode from 'qrcode';

export default function BookingsPage() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  const filteredBookings = state.bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'confirmed' || b.status === 'in-progress';
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  useEffect(() => {
    const gen = async () => {
      for (const b of filteredBookings) {
        if (b.status === 'confirmed' && !qrImages[b.id]) {
          try { const url = await QRCode.toDataURL(b.qrCode, { width: 180, margin: 2 }); setQrImages(prev => ({ ...prev, [b.id]: url })); } catch { /* */ }
        }
      }
    };
    gen();
  }, [filteredBookings.length]);

  const handleStartCharging = async (id: string) => {
    try {
      await api.startCharging(id);
      dispatch({ type: 'START_CHARGING', payload: id });
    } catch (err: any) { alert(err.message); }
  };

  const handleStopCharging = async (id: string) => {
    try {
      const response = await api.stopCharging(id, { energyDelivered: 15, cost: 0 });
      dispatch({ type: 'ADD_BOOKING', payload: response.booking }); // updates booking state
      
      // Refresh stations to get updated connector status (port becomes 1 again)
      try {
        const stations = await api.getStations();
        dispatch({ type: 'SET_STATIONS', payload: stations as any });
      } catch {}
      
      alert('Charging stopped and port released successfully!');
    } catch (err: any) { alert(err.message); }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await api.cancelBooking(id);
      dispatch({ type: 'CANCEL_BOOKING', payload: id });
      if (response.transaction) {
        dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
      }
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

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-3xl font-black mb-1">My Bookings</h2>
        <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your charging reservations</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 capitalize
              ${filter === f ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : state.darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500 surface-raised'}`}
          >{f}{f === 'upcoming' && <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px]">{state.bookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress').length}</span>}</button>
        ))}
      </div>

      <div className="space-y-3 stagger">
        {filteredBookings.map(booking => {
          const isExpanded = expandedBooking === booking.id;
          return (
            <div key={booking.id} className={`rounded-3xl overflow-hidden transition-all duration-500 card-float
              ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
              <button onClick={() => setExpandedBooking(isExpanded ? null : booking.id)} className="w-full p-5 text-left">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-bold text-lg">{booking.stationName}</h3>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold capitalize badge-3d" style={{ backgroundColor: getStatusColor(booking.status) + '18', color: getStatusColor(booking.status) }}>{booking.status}</span>
                    </div>
                    <div className={`flex flex-wrap items-center gap-3 text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(booking.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                      <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{booking.connectorType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-500 text-lg">{formatCurrency(booking.amount)}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className={`px-5 pb-5 pt-0 border-t ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'} animate-slide-up`}>
                  <div className="pt-4 space-y-4">
                    {booking.status === 'confirmed' && qrImages[booking.id] && (
                      <div className="text-center">
                        <p className={`text-sm mb-3 font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}><QrCode className="w-4 h-4 inline mr-1" />Show at station</p>
                        <img src={qrImages[booking.id]} alt="QR" className="mx-auto rounded-2xl shadow-lg" />
                      </div>
                    )}
                    {booking.status === 'completed' && booking.energyDelivered && (
                      <div className={`rounded-2xl p-4 ${state.darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold"><Battery className="w-5 h-5" />{booking.energyDelivered} kWh delivered</div>
                      </div>
                    )}
                    <div className={`rounded-2xl p-4 text-sm space-y-2 ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-between"><span className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>Booking ID</span><span className="font-mono text-xs font-bold">{booking.id}</span></div>
                      <div className="flex justify-between"><span className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>Created</span><span className="font-medium">{formatDate(booking.createdAt)}</span></div>
                    </div>
                    {booking.status === 'confirmed' && (
                      <div className="flex gap-3">
                        <button onClick={() => handleStartCharging(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl gradient-green text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all">
                          <PlayCircle className="w-5 h-5" />Start Charging
                        </button>
                        <button onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-300 text-red-500 font-bold hover:bg-red-50 transition-all">
                          <XCircle className="w-5 h-5" />Cancel
                        </button>
                      </div>
                    )}
                    {booking.status === 'in-progress' && (
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => handleStopCharging(booking.id)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl transition-all uppercase tracking-wide">
                          <XCircle className="w-5 h-5" /> Stop Charging & Release Port
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gray-200/50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-5"><Calendar className="w-10 h-10 text-gray-300" /></div>
            <h3 className="text-xl font-bold mb-2">No bookings</h3>
            <p className={state.darkMode ? 'text-gray-500' : 'text-gray-400'}>{filter === 'all' ? 'Book a slot to get started' : `No ${filter} bookings`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
