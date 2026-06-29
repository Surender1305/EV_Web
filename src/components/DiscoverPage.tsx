import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Station, ConnectorType } from '../types';
import { calculateDistance, getAvailablePorts } from '../utils/helpers';
import MapView from './MapView';
import StationCard from './StationCard';
import StationDetail from './StationDetail';
import { Search, SlidersHorizontal, Map, List, X, Zap, Sparkles } from 'lucide-react';

export default function DiscoverPage() {
  const { state, dispatch } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const userLat = 11.9416;
  const userLng = 79.8083;

  const filteredStations = useMemo(() => {
    let stations = state.stations.map(s => ({ ...s, distance: calculateDistance(userLat, userLng, s.lat, s.lng) }));
    if (state.filters.searchQuery) {
      const q = state.filters.searchQuery.toLowerCase();
      stations = stations.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    if (state.filters.connectorTypes.length > 0) stations = stations.filter(s => s.connectors.some(c => state.filters.connectorTypes.includes(c.type)));
    if (state.filters.minPowerKw > 0) stations = stations.filter(s => s.connectors.some(c => c.powerKw >= state.filters.minPowerKw));
    if (state.filters.maxPrice < 100) stations = stations.filter(s => s.pricePerKwh <= state.filters.maxPrice);
    if (state.filters.onlyAvailable) stations = stations.filter(s => getAvailablePorts(s) > 0);
    switch (sortBy) {
      case 'distance': stations.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)); break;
      case 'price': stations.sort((a, b) => a.pricePerKwh - b.pricePerKwh); break;
      case 'rating': stations.sort((a, b) => b.rating - a.rating); break;
    }
    return stations;
  }, [state.stations, state.filters, sortBy]);

  const handleStationSelect = useCallback((station: Station) => {
    dispatch({ type: 'SELECT_STATION', payload: station });
  }, [dispatch]);

  if (state.selectedStation) {
    return <StationDetail station={state.selectedStation} onBack={() => dispatch({ type: 'SELECT_STATION', payload: null })} />;
  }

  const connectorTypes: ConnectorType[] = ['CCS', 'CHAdeMO', 'Type 2', 'Tesla'];
  const activeFilterCount = state.filters.connectorTypes.length + (state.filters.minPowerKw > 0 ? 1 : 0) + (state.filters.onlyAvailable ? 1 : 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search Bar */}
      <div className={`px-4 py-3 relative z-20 ${state.darkMode ? '' : ''}`}>
        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-300 surface-raised
            ${state.darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'}`}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search stations in Puducherry..." value={state.filters.searchQuery}
              onChange={e => dispatch({ type: 'SET_FILTERS', payload: { searchQuery: e.target.value } })}
              className={`flex-1 bg-transparent outline-none text-sm font-medium ${state.darkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
            />
            {state.filters.searchQuery && (
              <button onClick={() => dispatch({ type: 'SET_FILTERS', payload: { searchQuery: '' } })} className="hover:bg-gray-200/50 p-1 rounded-full transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl transition-all duration-300 relative surface-raised
              ${showFilters ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : state.darkMode ? 'bg-gray-800/90 border border-gray-700 text-gray-400 hover:text-white' : 'bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">{activeFilterCount}</div>
            )}
          </button>
          <div className={`flex rounded-2xl overflow-hidden surface-raised ${state.darkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
            <button onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'map' })}
              className={`p-3 transition-all duration-300 ${state.viewMode === 'map' ? 'bg-emerald-500 text-white' : state.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 bg-white/90'}`}>
              <Map className="w-5 h-5" />
            </button>
            <button onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
              className={`p-3 transition-all duration-300 ${state.viewMode === 'list' ? 'bg-emerald-500 text-white' : state.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 bg-white/90'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mt-3 p-5 rounded-3xl animate-scale-in surface-elevated
            ${state.darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'}`}>
            <div className="space-y-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connector Type</label>
                <div className="flex flex-wrap gap-2">
                  {connectorTypes.map(type => (
                    <button key={type}
                      onClick={() => {
                        const types = state.filters.connectorTypes.includes(type) ? state.filters.connectorTypes.filter(t => t !== type) : [...state.filters.connectorTypes, type];
                        dispatch({ type: 'SET_FILTERS', payload: { connectorTypes: types } });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${state.filters.connectorTypes.includes(type) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : state.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Power: {state.filters.minPowerKw} kW</label>
                <input type="range" min={0} max={350} step={10} value={state.filters.minPowerKw}
                  onChange={e => dispatch({ type: 'SET_FILTERS', payload: { minPowerKw: Number(e.target.value) } })} className="w-full mt-1" />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Price: ₹{state.filters.maxPrice}/kWh</label>
                <input type="range" min={5} max={100} step={1} value={state.filters.maxPrice}
                  onChange={e => dispatch({ type: 'SET_FILTERS', payload: { maxPrice: Number(e.target.value) } })} className="w-full mt-1" />
              </div>
              <button onClick={() => dispatch({ type: 'SET_FILTERS', payload: { onlyAvailable: !state.filters.onlyAvailable } })} className="flex items-center gap-3 cursor-pointer w-full">
                <div className={`relative w-12 h-7 rounded-full transition-all duration-300 ${state.filters.onlyAvailable ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : state.darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${state.filters.onlyAvailable ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-bold">Show available only</span>
              </button>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sort By</label>
                <div className="flex gap-2">
                  {(['distance', 'price', 'rating'] as const).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${sortBy === s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : state.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => { dispatch({ type: 'SET_FILTERS', payload: { connectorTypes: [], minPowerKw: 0, maxPrice: 100, onlyAvailable: false, searchQuery: '' } }); setShowFilters(false); }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition">
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
            <span className="font-bold text-emerald-500">{filteredStations.length}</span> stations found
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {state.viewMode === 'map' ? (
          <div className="flex h-full">
            <div className="flex-1 relative">
              <MapView stations={filteredStations} onStationSelect={handleStationSelect} selectedStation={state.selectedStation} />
            </div>
            <div className={`hidden lg:block w-80 overflow-y-auto border-l p-3 space-y-2 ${state.darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              {filteredStations.map(s => <StationCard key={s.id} station={s} onClick={() => handleStationSelect(s)} compact />)}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto h-full p-4 pb-24 md:pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {filteredStations.map(s => <StationCard key={s.id} station={s} onClick={() => handleStationSelect(s)} />)}
            </div>
            {filteredStations.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-gray-200/50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-5">
                  <Zap className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">No stations found</h3>
                <p className={state.darkMode ? 'text-gray-500' : 'text-gray-400'}>Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
