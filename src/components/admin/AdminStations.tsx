import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { Station } from '../../types';
import { Building2, Search, Trash2, MapPin, Zap } from 'lucide-react';

export default function AdminStations() {
  const { state } = useApp();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStations = async () => {
    try {
      const data = await api.getStations();
      setStations(data);
    } catch (err) {
      console.error('Failed to fetch stations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this station? This action cannot be undone.')) return;
    try {
      await api.deleteStation(id);
      setStations(stations.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete station');
    }
  };

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Station Management
          </h2>
          <p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            View and manage all charging stations on the platform.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-200'}`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStations.map(station => (
            <div key={station.id} className={`p-4 rounded-3xl border ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'} flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{station.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" /> {station.address}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(station.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete Station"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> {station.connectors.length} Ports
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-500">
                  ID: {station.id.split('-')[1] || station.id}
                </div>
              </div>
            </div>
          ))}

          {filteredStations.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No stations found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
