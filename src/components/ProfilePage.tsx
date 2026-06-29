import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/helpers';
import { Mail, Phone, Car, Wallet, Heart, Star, Settings, Shield, HelpCircle, LogOut, ChevronRight, Zap, Award, Edit2, Check, X, Moon, Sun, Globe, EyeOff, Eye } from 'lucide-react';
import { api } from '../utils/api';

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const user = state.user;
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<'settings' | 'security' | 'help' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicleName: user?.vehicleName || '',
    vehicleModel: user?.vehicleModel || '',
  });

  if (!user) return null;
  const completedBookings = state.bookings.filter(b => b.status === 'completed').length;
  const totalEnergy = state.bookings.filter(b => b.status === 'completed' && b.energyDelivered).reduce((s, b) => s + (b.energyDelivered || 0), 0);
  const favoriteStations = state.stations.filter(s => user.favoriteStations.includes(s.id));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.updateProfile(formData);
      dispatch({ type: 'UPDATE_USER', payload: res.user });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full px-4 py-2 mt-1 rounded-xl border ${state.darkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`;

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-black">Driver Profile</h1>
          <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your EV and account</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 font-bold hover:bg-blue-500/20 transition-all">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(false)} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/10 text-gray-600 font-bold hover:bg-gray-500/20 transition-all disabled:opacity-50">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-green text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`rounded-3xl overflow-hidden surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="gradient-green h-28 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute -bottom-10 left-6">
                <div className="w-[5.5rem] h-[5.5rem] rounded-3xl gradient-green flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-gray-800 shadow-2xl shadow-emerald-500/30">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
            <div className="pt-14 pb-5 px-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <div className={`flex flex-col gap-2 mt-4 text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" />{user.email}</span>
                    <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{user.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`rounded-3xl p-5 card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-sm mt-1"><Car className="w-7 h-7 text-blue-500" /></div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Brand/Name</label>
                      <input type="text" value={formData.vehicleName} onChange={e => setFormData({ ...formData, vehicleName: e.target.value })} className={inputClass} placeholder="e.g. Tata Nexon EV" />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Model/Number</label>
                      <input type="text" value={formData.vehicleModel} onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })} className={inputClass} placeholder="e.g. TN-01-XX-0000" />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg truncate">{user.vehicleName || 'Add Vehicle'}</h3>
                    <p className={`text-sm font-medium truncate ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.vehicleModel || 'Manage vehicle details'}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 stagger">
            {[
              { icon: Zap, color: 'emerald', val: completedBookings, label: 'Sessions' },
              { icon: Award, color: 'amber', val: `${totalEnergy.toFixed(0)}`, label: 'kWh Total' },
              { icon: Wallet, color: 'cyan', val: formatCurrency(user.walletBalance), label: 'Balance' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-4 text-center card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500 mx-auto mb-2`} />
                <div className="text-xl font-black">{s.val}</div>
                <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Favorites & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-3xl p-6 surface-raised ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500 fill-red-500" />Favorite Stations</h3>
            {favoriteStations.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {favoriteStations.map(s => (
                  <div key={s.id} className={`flex items-center gap-3.5 p-3.5 rounded-2xl border ${state.darkMode ? 'border-gray-700/50 bg-gray-700/30' : 'border-gray-100 bg-gray-50'}`}>
                    <img src={s.imageUrl} alt={s.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-xs font-bold">{s.rating}</span></div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No favorite stations yet.</p>
              </div>
            )}
          </div>

          <div className={`rounded-3xl overflow-hidden surface-raised ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className={`p-5 border-b ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
              <h3 className="font-bold text-lg">Preferences</h3>
            </div>
            <div className="p-2">
              {[
                { id: 'settings', icon: Settings, label: 'App Settings', desc: 'Manage application preferences and language' },
                { id: 'security', icon: Shield, label: 'Privacy & Security', desc: 'Change password and manage 2FA' },
                { id: 'help', icon: HelpCircle, label: 'Help & Support', desc: 'View FAQs and contact our support team' },
              ].map((item) => (
                <button key={item.label} onClick={() => setActiveModal(item.id as any)} className={`w-full flex items-center gap-4 p-4 text-left transition-all rounded-2xl ${state.darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} group`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <item.icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{item.label}</p>
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={() => dispatch({ type: 'LOGOUT' })} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-red-300 text-red-500 font-bold hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" />Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-in ${state.darkMode ? 'bg-gray-900 border border-gray-800 text-white' : 'bg-white border border-gray-100 text-gray-900'}`}>
            
            <div className={`px-6 py-4 flex items-center justify-between border-b ${state.darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <h3 className="font-black text-xl">
                {activeModal === 'settings' && 'App Settings'}
                {activeModal === 'security' && 'Privacy & Security'}
                {activeModal === 'help' && 'Help & Support'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {activeModal === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${state.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {state.darkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Dark Mode</p>
                        <p className={`text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle dark appearance</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${state.darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${state.darkMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${state.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Globe className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Language</p>
                        <p className={`text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select app language</p>
                      </div>
                    </div>
                    <select className={`text-sm rounded-lg border-0 bg-transparent font-bold ${state.darkMode ? 'text-white' : 'text-gray-900'} focus:ring-0 cursor-pointer`}>
                      <option>English</option>
                      <option>Tamil</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
              )}

              {activeModal === 'security' && (
                <div className="space-y-5">
                  <div>
                    <label className={`text-xs font-bold mb-2 block ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass} 
                        placeholder="••••••••" 
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters');
                      try {
                        setSaving(true);
                        await api.resetPassword({ email: user.email, newPassword });
                        alert('Password updated successfully!');
                        setActiveModal(null);
                        setNewPassword('');
                      } catch(e) {
                        alert('Failed to update password');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving || !newPassword}
                    className="w-full py-3 rounded-xl gradient-green text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {[
                    { q: 'How do I top-up my wallet?', a: 'Go to the Wallet tab, click Top Up, and choose your preferred payment method like UPI or Card.' },
                    { q: 'What happens if I overstay my booking?', a: 'You will be charged a penalty fee for every 15 minutes you occupy the spot after your session ends.' },
                    { q: 'Can I cancel a booking?', a: 'Yes, you can cancel up to 10 minutes before your slot starts for a full refund.' }
                  ].map((faq, idx) => (
                    <div key={idx} className={`p-4 rounded-xl ${state.darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className="font-bold text-sm mb-1">{faq.q}</p>
                      <p className={`text-xs leading-relaxed ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{faq.a}</p>
                    </div>
                  ))}
                  
                  <div className={`mt-6 p-4 rounded-xl text-center ${state.darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <p className="font-bold text-sm mb-1">Need more help?</p>
                    <p className="text-xs">Contact us at support@evlink.in<br/>or call +91 98765 43210</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
