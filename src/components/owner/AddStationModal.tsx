import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { Station, ConnectorType, Connector } from '../../types';
import { getConnectorColor } from '../../utils/helpers';
import { X, Plus, Trash2, MapPin, Zap, Clock, IndianRupee, Image } from 'lucide-react';

interface Props { station: Station | null; onClose: () => void; }
const TYPES: ConnectorType[] = ['CCS', 'CHAdeMO', 'Type 2', 'Tesla'];
const POWER = [7, 11, 22, 50, 60, 100, 120, 150, 250, 350];
const IMGS = [
  'https://images.pexels.com/photos/4678065/pexels-photo-4678065.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  'https://images.pexels.com/photos/28851165/pexels-photo-28851165.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  'https://images.pexels.com/photos/35736784/pexels-photo-35736784.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  'https://images.pexels.com/photos/9800004/pexels-photo-9800004.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  'https://images.pexels.com/photos/29163104/pexels-photo-29163104.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  'https://images.pexels.com/photos/33083244/pexels-photo-33083244.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
];
const AMENITIES = ['WiFi','Restroom','Café','Parking','Security','24hr Access','Waiting Area','Shopping','Restaurant','ATM','Solar Powered'];

export default function AddStationModal({ station, onClose }: Props) {
  const { state, dispatch } = useApp();
  const isEdit = !!station;
  const [name, setName] = useState(station?.name || '');
  const [address, setAddress] = useState(station?.address || '');
  const [lat, setLat] = useState(station?.lat || 11.9416);
  const [lng, setLng] = useState(station?.lng || 79.8083);
  const [price, setPrice] = useState(station?.pricePerKwh || 14);
  const [hours, setHours] = useState(station?.operatingHours || '24/7');
  const [imageUrl, setImageUrl] = useState(station?.imageUrl || IMGS[0]);
  const [amenities, setAmenities] = useState<string[]>(station?.amenities || []);
  const [connectors, setConnectors] = useState<Partial<Connector>[]>(station?.connectors || [{ type: 'CCS', powerKw: 50, status: 'available' }]);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    const data: Station = { id: station?.id || `station-${Date.now()}`, name, address, lat, lng, pricePerKwh: price, operatingHours: hours, imageUrl, amenities,
      connectors: connectors.map((c, i) => ({ id: `c-${Date.now()}-${i}`, type: c.type as ConnectorType, powerKw: c.powerKw || 22, status: 'available' as const })),
      rating: station?.rating || 4.5, reviewCount: station?.reviewCount || 0, ownerId: state.user?.id || 'owner-1' };
      
    try {
      let response;
      if (isEdit) {
        response = await api.updateStation(data.id, data);
        dispatch({ type: 'UPDATE_STATION', payload: response });
      } else {
        response = await api.addStation(data);
        dispatch({ type: 'ADD_STATION', payload: response });
      }
      onClose();
    } catch (err: any) { alert(err.message); }
  };

  const inputClass = `w-full px-4 py-3.5 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 font-medium
    ${state.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 shadow-sm'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-scale-in">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl surface-floating ${state.darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${state.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div>
            <h2 className="text-2xl font-black">{isEdit ? 'Edit Station' : 'Add New Station'}</h2>
            <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Step {step} of 3</p>
          </div>
          <button onClick={onClose} className={`p-2.5 rounded-2xl transition ${state.darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        <div className="px-5 py-3">
          <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i <= step ? 'gradient-purple shadow-sm' : state.darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />)}</div>
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-bold flex items-center gap-2 text-lg"><MapPin className="w-5 h-5 text-purple-500" />Basic Information</h3>
              <div>
                <label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Station Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., GreenCharge Hub - Beach Road" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address, Puducherry" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Latitude</label><input type="number" step="0.0001" value={lat} onChange={e => setLat(parseFloat(e.target.value))} className={inputClass} /></div>
                <div><label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Longitude</label><input type="number" step="0.0001" value={lng} onChange={e => setLng(parseFloat(e.target.value))} className={inputClass} /></div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}><Image className="w-4 h-4 inline mr-1" />Station Photo</label>
                <div className="grid grid-cols-3 gap-2.5">{IMGS.map((img, i) => (
                  <button key={i} onClick={() => setImageUrl(img)} className={`relative rounded-2xl overflow-hidden aspect-video border-3 transition-all duration-300 ${imageUrl === img ? 'border-purple-500 ring-4 ring-purple-500/20 scale-105' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-purple-500" />Connectors</h3>
                <button onClick={() => setConnectors([...connectors, { type: 'Type 2', powerKw: 22, status: 'available' }])}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-500 text-sm font-bold hover:bg-purple-500/20 transition"><Plus className="w-4 h-4" />Add Port</button>
              </div>
              <div className="space-y-3">
                {connectors.map((conn, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl ${state.darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold">Port {idx + 1}</span>
                      {connectors.length > 1 && <button onClick={() => setConnectors(connectors.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={`block text-xs font-bold mb-1 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</label>
                        <select value={conn.type} onChange={e => { const u = [...connectors]; u[idx] = { ...u[idx], type: e.target.value as ConnectorType }; setConnectors(u); }}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium ${state.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div><label className={`block text-xs font-bold mb-1 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Power (kW)</label>
                        <select value={conn.powerKw} onChange={e => { const u = [...connectors]; u[idx] = { ...u[idx], powerKw: parseInt(e.target.value) }; setConnectors(u); }}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium ${state.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                          {POWER.map(p => <option key={p} value={p}>{p} kW</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-2"><span className="inline-block px-3 py-1 rounded-xl text-xs font-bold text-white shadow-md badge-3d" style={{ backgroundColor: getConnectorColor(conn.type as ConnectorType) }}>{conn.type} · {conn.powerKw} kW</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-bold flex items-center gap-2 text-lg"><IndianRupee className="w-5 h-5 text-purple-500" />Pricing & Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price/kWh (₹)</label>
                  <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className={inputClass} /></div>
                <div><label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}><Clock className="w-4 h-4 inline mr-1" />Hours</label>
                  <select value={hours} onChange={e => setHours(e.target.value)} className={inputClass}>
                    {['24/7','6:00 AM – 10:00 PM','6:00 AM – 12:00 AM','5:00 AM – 11:00 PM','7:00 AM – 9:00 PM'].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amenities</label>
                <div className="flex flex-wrap gap-2">{AMENITIES.map(a => (
                  <button key={a} onClick={() => setAmenities(amenities.includes(a) ? amenities.filter(x => x !== a) : [...amenities, a])}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${amenities.includes(a) ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105' : state.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{a}</button>
                ))}</div>
              </div>
              {/* Summary */}
              <div className={`p-5 rounded-2xl border-2 ${state.darkMode ? 'bg-gray-800/80 border-purple-500/20' : 'bg-purple-50/50 border-purple-200'}`}>
                <h4 className="font-bold text-lg mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[['Name', name || '—'], ['Address', address || '—'], ['Ports', `${connectors.length}`], ['Price', `₹${price}/kWh`]].map(([k, v]) => (
                    <><div key={k} className={state.darkMode ? 'text-gray-400' : 'text-gray-500'}>{k}:</div><div className="font-bold">{v}</div></>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`sticky bottom-0 flex gap-3 p-5 border-t ${state.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {step > 1 && <button onClick={() => setStep(step - 1)} className={`flex-1 py-3.5 rounded-2xl font-bold ${state.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>Back</button>}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!name || !address)} className="flex-1 py-3.5 rounded-2xl gradient-purple text-white font-bold shadow-lg shadow-purple-500/30 disabled:opacity-40">Continue</button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 py-3.5 rounded-2xl gradient-purple text-white font-bold shadow-lg shadow-purple-500/30">{isEdit ? 'Save Changes' : 'Add Station'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
