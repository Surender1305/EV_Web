import { useState, useEffect } from 'react';
import { Station, Booking } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { getAvailablePorts, getTotalPorts, getConnectorColor, getStatusColor, formatCurrency, generateTimeSlots, formatTime, getEndTime } from '../utils/helpers';
import { ArrowLeft, Star, MapPin, Heart, Clock, Zap, Wifi, Coffee, Car, Navigation, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';

interface StationDetailProps { station: Station; onBack: () => void; }

export default function StationDetail({ station, onBack }: StationDetailProps) {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<'info' | 'book'>('info');
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const available = getAvailablePorts(station);
  const total = getTotalPorts(station);
  const isFavorite = state.user?.favoriteStations.includes(station.id);

  useEffect(() => { 
    setSelectedDate(new Date().toISOString().split('T')[0]); 
    api.getStationBookings(station.id).then(res => setStationBookings(res)).catch(() => {});
  }, [station.id]);
  
  const relevantBookings = stationBookings.filter(b => b.date === selectedDate && b.connectorId === selectedConnector);
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate, relevantBookings) : [];
  const selectedConnectorObj = station.connectors.find(c => c.id === selectedConnector);
  const estimatedCost = selectedConnectorObj ? (selectedConnectorObj.powerKw * (duration / 60) * station.pricePerKwh) : 0;

  const getAmenityIcon = (a: string) => {
    switch (a.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'café': case 'cafe': case 'food court': case 'organic café': return <Coffee className="w-4 h-4" />;
      case 'parking': case 'valet': return <Car className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const handleBook = async () => {
    if (!selectedConnector || !selectedTime || !selectedDate || !state.isAuthenticated) return;
    const bookingId = `booking-${Date.now()}`;
    const qrValue = `CF-${bookingId}-${station.id}`;
    try { const url = await QRCode.toDataURL(qrValue, { width: 200, margin: 2, color: { dark: '#0f172a' } }); setQrDataUrl(url); } catch { setQrDataUrl(''); }
    
    try {
      const response = await api.createBooking({
        id: bookingId, userId: state.user!.id, stationId: station.id, stationName: station.name,
        connectorId: selectedConnector, connectorType: selectedConnectorObj!.type, date: selectedDate,
        startTime: selectedTime, endTime: getEndTime(selectedTime, duration), status: 'confirmed',
        amount: Math.round(estimatedCost * 100) / 100, qrCode: qrValue, createdAt: new Date().toISOString(),
      });
      
      dispatch({ type: 'ADD_BOOKING', payload: response.booking });
      dispatch({ type: 'ADD_TRANSACTION', payload: response.transaction });
      if (response.user) {
        dispatch({ type: 'UPDATE_USER', payload: { walletBalance: response.user.walletBalance } });
      }
      // Refresh stations to get updated connector status
      try {
        const stations = await api.getStations();
        dispatch({ type: 'SET_STATIONS', payload: stations as any });
      } catch {}
      setBookingConfirmed(response.booking);
      api.getStationBookings(station.id).then(res => setStationBookings(res)).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Failed to book slot');
    }
  };

  const handleEmergencyOverride = async (connectorId: string) => {
    if (!window.confirm('WARNING: This will forcefully disconnect the current vehicle. Proceed with emergency override?')) return;
    try {
      const response = await api.emergencyOverride({ stationId: station.id, connectorId });
      dispatch({ type: 'ADD_BOOKING', payload: response.booking });
      try {
        const stations = await api.getStations();
        dispatch({ type: 'SET_STATIONS', payload: stations as any });
      } catch {}
      setBookingConfirmed(response.booking);
    } catch (err: any) {
      alert(err.message || 'Emergency override failed');
    }
  };

  const toggleFav = async () => {
    try {
      await api.toggleFavorite(station.id);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: station.id });
    } catch (err) {
      console.error(err);
    }
  };

  // ─── BOOKING CONFIRMED ─────────
  if (bookingConfirmed) {
    return (
      <div className="p-4 pb-24 md:pb-4 flex items-center justify-center min-h-[60vh]">
        <div className={`w-full max-w-lg rounded-3xl overflow-hidden animate-bounce-in surface-floating ${state.darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="gradient-green p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/20 mx-auto flex items-center justify-center mb-4 animate-float shadow-2xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black">Booking Confirmed!</h2>
              <p className="text-white/70 mt-1 font-medium">Your charging slot is reserved</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className={`rounded-2xl p-4 ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Station', bookingConfirmed.stationName],
                  ['Connector', bookingConfirmed.connectorType],
                  ['Date', bookingConfirmed.date],
                  ['Time', `${formatTime(bookingConfirmed.startTime)} – ${formatTime(bookingConfirmed.endTime)}`],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <span className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>{k}</span>
                    <p className="font-bold mt-0.5">{v}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <span className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>Amount</span>
                  <p className="font-black text-emerald-500 text-2xl mt-0.5">{formatCurrency(bookingConfirmed.amount)}</p>
                </div>
              </div>
            </div>
            {qrDataUrl && (
              <div className="text-center">
                <p className={`text-sm mb-3 font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Show QR at station to check in</p>
                <img src={qrDataUrl} alt="QR" className="mx-auto rounded-2xl shadow-lg" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={onBack} className={`flex-1 py-3.5 rounded-2xl font-bold transition-all card-float ${state.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>Back to Map</button>
              <button onClick={() => { setBookingConfirmed(null); setTab('info'); }} className="flex-1 py-3.5 rounded-2xl gradient-green text-white font-bold shadow-lg shadow-emerald-500/30">View Details</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-4 animate-slide-up">
      {/* Hero */}
      <div className="relative">
        <img src={station.imageUrl} alt={station.name} className="w-full h-60 md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 p-2.5 rounded-2xl bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition border border-white/10 shadow-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {state.isAuthenticated && (
          <button onClick={toggleFav}
            className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-xl transition-all shadow-lg border border-white/10 ${isFavorite ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-black/30 text-white hover:bg-black/50'}`}>
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">{station.name}</h1>
          <div className="flex items-center gap-2 text-white/80 text-sm"><MapPin className="w-3.5 h-3.5" />{station.address}</div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className={`px-4 py-3 flex items-center gap-4 border-b ${state.darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-bold">{station.rating}</span><span className={`text-sm ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({station.reviewCount})</span></div>
        <div className={`w-px h-5 ${state.darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-1.5 font-bold ${available > 0 ? 'text-emerald-500' : 'text-red-500'}`}><Zap className="w-4 h-4" />{available}/{total}</div>
        <div className={`w-px h-5 ${state.darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <div className="flex items-center gap-1.5 text-sm"><Clock className="w-3.5 h-3.5 text-gray-400" />{station.operatingHours}</div>
      </div>

      {/* Tabs */}
      <div className={`px-4 border-b ${state.darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex gap-0">
          {['info', 'book'].map(t => (
            <button key={t} onClick={() => setTab(t as 'info' | 'book')}
              className={`px-6 py-3.5 text-sm font-bold border-b-3 transition-all capitalize ${tab === t ? 'border-emerald-500 text-emerald-500' : `border-transparent ${state.darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-900'}`}`}
            >{t === 'info' ? 'Details' : 'Book Slot'}</button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === 'info' ? (
          <div className="space-y-6 max-w-3xl stagger">
            {/* Pricing */}
            <div className={`rounded-3xl p-5 surface-raised ${state.darkMode ? 'bg-gray-800/80' : 'bg-gradient-to-r from-emerald-50 to-cyan-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl gradient-green flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price per kWh</p>
                  <div className="text-4xl font-black text-emerald-500">{formatCurrency(station.pricePerKwh)}</div>
                </div>
              </div>
            </div>
            {/* Connectors */}
            <div>
              <h3 className="font-bold text-lg mb-3">Charging Ports</h3>
              <div className="grid gap-2.5">
                {station.connectors.map(conn => (
                  <div key={conn.id} className={`flex items-center justify-between p-4 rounded-2xl card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-md badge-3d" style={{ backgroundColor: getConnectorColor(conn.type) }}>{conn.type}</div>
                      <div><p className="font-bold text-sm">{conn.type}</p><p className={`text-xs font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conn.powerKw} kW</p></div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize badge-3d" style={{ backgroundColor: getStatusColor(conn.status) + '18', color: getStatusColor(conn.status) }}>{conn.status}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Amenities */}
            <div>
              <h3 className="font-bold text-lg mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map(a => (
                  <div key={a} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold surface-raised ${state.darkMode ? 'bg-gray-800/80' : 'bg-white'}`}>
                    {getAmenityIcon(a)} {a}
                  </div>
                ))}
              </div>
            </div>
            {/* Navigate */}
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all card-float">
              <Navigation className="w-6 h-6" /><span className="font-bold text-lg">Navigate to Station</span><ChevronRight className="w-5 h-5 ml-auto" />
            </a>
            {state.isAuthenticated && available > 0 && (
              <button onClick={() => setTab('book')} className="w-full py-5 rounded-3xl gradient-green text-white font-black text-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all">
                Book a Charging Slot
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-3xl space-y-6 animate-slide-up">
            {!state.isAuthenticated ? (
              <div className={`text-center py-16 rounded-3xl surface-raised ${state.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className="text-xl font-bold mb-2">Sign in to book</p>
              </div>
            ) : state.user?.role === 'emergency' ? (
              <div className="space-y-6">
                <div className={`p-5 rounded-3xl border-2 border-red-500 bg-red-500/10`}>
                  <h2 className="text-xl font-black text-red-500 mb-2 flex items-center gap-2"><Zap /> EMERGENCY OVERRIDE PROTOCOL</h2>
                  <p className="text-sm font-medium text-red-600/80 dark:text-red-400">Authorized emergency vehicles can preempt any slot. Current charging sessions will be instantly terminated and fully refunded.</p>
                </div>
                
                <h3 className="font-bold text-lg mb-3">Select Connector to Override</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {station.connectors.map(conn => (
                    <div key={conn.id} className={`p-5 rounded-2xl border-2 ${state.darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
                       <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md" style={{ backgroundColor: getConnectorColor(conn.type) }}>{conn.type.charAt(0)}</div>
                           <div><p className="font-bold text-lg">{conn.type}</p><p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conn.powerKw} kW</p></div>
                         </div>
                         <span className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize badge-3d" style={{ backgroundColor: getStatusColor(conn.status) + '18', color: getStatusColor(conn.status) }}>{conn.status}</span>
                       </div>
                       <button onClick={() => handleEmergencyOverride(conn.id)} className="w-full py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all uppercase tracking-wide">
                         Preempt & Connect
                       </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Connector Selection */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg gradient-green text-white text-xs font-black flex items-center justify-center shadow-md">1</span>
                    Select Connector
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {station.connectors.filter(c => c.status === 'available').map(conn => (
                      <button key={conn.id} onClick={() => setSelectedConnector(conn.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 card-float
                          ${selectedConnector === conn.id ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : state.darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-md" style={{ backgroundColor: getConnectorColor(conn.type) }}>{conn.type.charAt(0)}</div>
                          <div><p className="font-bold text-sm">{conn.type}</p><p className={`text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conn.powerKw} kW</p></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Date */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg gradient-green text-white text-xs font-black flex items-center justify-center shadow-md">2</span>
                    Select Date
                  </h3>
                  <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                    className={`w-full px-4 py-3.5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium ${state.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 shadow-sm'}`} />
                </div>
                {/* Duration */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg gradient-green text-white text-xs font-black flex items-center justify-center shadow-md">3</span>
                    Duration
                  </h3>
                  <div className="flex gap-2.5">
                    {[30, 60, 90, 120].map(d => (
                      <button key={d} onClick={() => setDuration(d)}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${duration === d ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : state.darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600 surface-raised'}`}
                      >{d}m</button>
                    ))}
                  </div>
                </div>
                {/* Time Slots */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg gradient-green text-white text-xs font-black flex items-center justify-center shadow-md">4</span>
                    Time Slot
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
                    {timeSlots.map(slot => (
                      <button key={slot.time} disabled={!slot.available} onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all duration-300
                          ${!slot.available ? 'opacity-25 cursor-not-allowed' :
                            selectedTime === slot.time ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' :
                            state.darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >{formatTime(slot.time)}</button>
                    ))}
                  </div>
                </div>
                {/* Summary */}
                {selectedConnector && selectedTime && (
                  <div className={`rounded-3xl p-5 border-2 animate-scale-in ${state.darkMode ? 'bg-gray-800/80 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'}`}>
                    <h3 className="font-bold mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      {[['Connector', `${selectedConnectorObj?.type} (${selectedConnectorObj?.powerKw} kW)`],
                        ['Date', selectedDate],
                        ['Time', `${formatTime(selectedTime)} – ${formatTime(getEndTime(selectedTime, duration))}`],
                        ['Duration', `${duration} minutes`],
                        ['Rate', `${formatCurrency(station.pricePerKwh)}/kWh`]
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>{k}</span><span className="font-bold">{v}</span></div>
                      ))}
                      <div className={`flex justify-between pt-3 border-t ${state.darkMode ? 'border-gray-700' : 'border-emerald-200'}`}>
                        <span className="font-bold text-lg">Estimated Cost</span>
                        <div className="text-right">
                          <span className="font-black text-emerald-500 text-2xl">{formatCurrency(estimatedCost)}</span>
                          <p className="text-[10px] text-gray-500 font-medium">({selectedConnectorObj?.powerKw}kW × {(duration / 60).toFixed(1)}h × {formatCurrency(station.pricePerKwh)})</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button onClick={handleBook} disabled={!selectedConnector || !selectedTime}
                  className="w-full py-5 rounded-3xl gradient-green text-white font-black text-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                  <Calendar className="w-6 h-6 inline mr-2" />Confirm Booking{estimatedCost > 0 && ` · ${formatCurrency(estimatedCost)}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
