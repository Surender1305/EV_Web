import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Station } from '../../types';
import { api } from '../../utils/api';
import { formatCurrency, getConnectorColor, getStatusColor } from '../../utils/helpers';
import { Plus, MapPin, Star, Zap, Edit2, Trash2, Clock, Users, TrendingUp } from 'lucide-react';
import AddStationModal from './AddStationModal';

export default function MyStations() {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStation, setEditStation] = useState<Station | null>(null);
  const ownerStations = state.stations.filter(s => s.ownerId === state.user?.id);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this station?')) {
      try {
        await api.deleteStation(id);
        dispatch({ type: 'DELETE_STATION', payload: id });
      } catch (err: any) { alert(err.message); }
    }
  };

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-black">My Stations</h1>
          <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your charging stations</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl gradient-purple text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all hover:scale-105">
          <Plus className="w-5 h-5" />Add Station
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger">
        {[
          { icon: Zap, color: 'purple', val: ownerStations.length, label: 'Stations' },
          { icon: Zap, color: 'emerald', val: ownerStations.reduce((s, st) => s + st.connectors.length, 0), label: 'Total Ports' },
          { icon: Users, color: 'blue', val: 12, label: 'Bookings Today' },
          { icon: TrendingUp, color: 'amber', val: '4.6', label: 'Avg Rating' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 text-${s.color}-500`} /><span className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</span></div>
            <div className="text-2xl font-black">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5 stagger">
        {ownerStations.map(station => {
          const available = station.connectors.filter(c => c.status === 'available').length;
          const total = station.connectors.length;
          return (
            <div key={station.id} className={`rounded-3xl overflow-hidden card-3d ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
              <div className="relative h-40">
                <img src={station.imageUrl} alt={station.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => setEditStation(station)} className="p-2.5 rounded-xl bg-white/15 backdrop-blur-xl text-white hover:bg-white/25 transition border border-white/10 shadow-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => handleDelete(e, station.id)} className="p-2.5 rounded-xl bg-red-500/80 backdrop-blur-xl text-white hover:bg-red-500 transition shadow-lg shadow-red-500/30"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-xl shadow-lg badge-3d ${available > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>{available}/{total} Available</div>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-xl rounded-xl px-2.5 py-1 shadow-lg border border-white/10">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-white text-xs font-bold">{station.rating}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{station.name}</h3>
                <div className={`flex items-center gap-1.5 text-sm mb-3 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}><MapPin className="w-3.5 h-3.5" /><span className="truncate">{station.address}</span></div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Array.from(new Set(station.connectors.map(c => c.type))).map(type => {
                    const conn = station.connectors.find(c => c.type === type)!;
                    return <span key={type} className="px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-md badge-3d" style={{ backgroundColor: getConnectorColor(type) }}>{type} · {conn.powerKw}kW</span>;
                  })}
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-3">
                  {station.connectors.map(conn => <div key={conn.id} className="h-2.5 rounded-full shadow-sm" style={{ backgroundColor: getStatusColor(conn.status) }} title={`${conn.type} - ${conn.status}`} />)}
                </div>
                <div className={`flex items-center justify-between pt-3 border-t ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                  <div><span className="text-xl font-black text-emerald-500">{formatCurrency(station.pricePerKwh)}</span><span className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/kWh</span></div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}><Clock className="w-3.5 h-3.5" />{station.operatingHours}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ownerStations.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-3xl gradient-purple mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 animate-float"><Zap className="w-12 h-12 text-white" /></div>
          <h3 className="text-2xl font-black mb-2">No stations yet</h3>
          <p className={`mb-6 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add your first station to start earning</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-purple text-white font-bold text-lg shadow-lg shadow-purple-500/30"><Plus className="w-5 h-5" />Add First Station</button>
        </div>
      )}

      {(showAddModal || editStation) && <AddStationModal station={editStation} onClose={() => { setShowAddModal(false); setEditStation(null); }} />}
    </div>
  );
}
