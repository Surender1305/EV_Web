import { Station } from '../types';
import { useApp } from '../context/AppContext';
import { getAvailablePorts, getTotalPorts, getConnectorColor, formatCurrency } from '../utils/helpers';
import { Star, MapPin, Heart, Clock, Zap } from 'lucide-react';

interface StationCardProps {
  station: Station;
  onClick: () => void;
  compact?: boolean;
}

export default function StationCard({ station, onClick, compact = false }: StationCardProps) {
  const { state, dispatch } = useApp();
  const available = getAvailablePorts(station);
  const total = getTotalPorts(station);
  const isFavorite = state.user?.favoriteStations.includes(station.id);
  const uniqueConnectors = Array.from(new Set(station.connectors.map(c => c.type)));

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-3.5 rounded-2xl transition-all duration-300 card-float group
          ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50 hover:border-gray-600' : 'bg-white/90 border border-gray-200/80 hover:border-emerald-300'}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={station.imageUrl} alt={station.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow" />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-md
              ${available > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {available}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{station.name}</h4>
            <p className={`text-xs truncate mt-0.5 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{station.address}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold">{station.rating}</span>
              </div>
              <span className="text-xs font-bold text-emerald-500">{formatCurrency(station.pricePerKwh)}/kWh</span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer group card-3d
        ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={station.imageUrl} alt={station.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Fav button */}
        {state.isAuthenticated && (
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: station.id }); }}
            className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-lg
              ${isFavorite ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Availability badge */}
        <div className="absolute bottom-3 left-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-xl shadow-lg badge-3d
            ${available > 0 ? 'bg-emerald-500/90 text-white shadow-emerald-500/30' : 'bg-red-500/90 text-white shadow-red-500/30'}`}>
            <Zap className="w-3 h-3 inline mr-1" />
            {available}/{total} Available
          </div>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-xl rounded-xl px-3 py-1.5 shadow-lg border border-white/10">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-bold">{station.rating}</span>
          <span className="text-white/50 text-xs">({station.reviewCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1.5 group-hover:text-emerald-500 transition-colors">{station.name}</h3>
        <div className={`flex items-center gap-1.5 text-sm mb-4 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{station.address}</span>
        </div>

        {/* Connector badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {uniqueConnectors.map(type => {
            const conn = station.connectors.find(c => c.type === type)!;
            return (
              <span
                key={type}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-md badge-3d"
                style={{ backgroundColor: getConnectorColor(type) }}
              >
                {type} · {conn.powerKw}kW
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <span className="font-black text-emerald-500 text-lg">{formatCurrency(station.pricePerKwh)}</span>
              <span className={`text-xs ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/kWh</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-3.5 h-3.5" />
            {station.operatingHours}
          </div>
        </div>
      </div>
    </div>
  );
}
