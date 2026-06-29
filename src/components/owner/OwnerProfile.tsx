import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Mail, Phone, Building2, IndianRupee, Star, Settings, Shield, HelpCircle, LogOut, ChevronRight, Zap, FileText } from 'lucide-react';

export default function OwnerProfile() {
  const { state, dispatch } = useApp();
  const user = state.user;
  if (!user) return null;
  const ownerStations = state.stations.filter(s => s.ownerId === state.user?.id);
  const totalConn = ownerStations.reduce((s, st) => s + st.connectors.length, 0);
  const avgR = ownerStations.length > 0 ? (ownerStations.reduce((s, st) => s + st.rating, 0) / ownerStations.length).toFixed(1) : '0';

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-black">Profile & Settings</h1>
        <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your owner account</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`rounded-3xl overflow-hidden surface-elevated ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="gradient-purple h-28 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute -bottom-10 left-6">
                <div className="w-[5.5rem] h-[5.5rem] rounded-3xl gradient-purple flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-gray-800 shadow-2xl shadow-purple-500/30">{user.name.charAt(0)}</div>
              </div>
              <div className="absolute top-3 right-3 px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-xl text-white text-xs font-bold border border-white/10"><Building2 className="w-3 h-3 inline mr-1" />Station Owner</div>
            </div>
            <div className="pt-14 pb-5 px-6">
              <h2 className="text-2xl font-black">{user.name}</h2>
              <div className={`flex flex-col gap-2 mt-4 text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center gap-2"><Mail className="w-4 h-4" />{user.email}</span>
                <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{user.phone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 stagger">
            {[
              { icon: Building2, color: 'purple', val: ownerStations.length, label: 'Stations' },
              { icon: Zap, color: 'emerald', val: totalConn, label: 'Ports' },
              { icon: Star, color: 'amber', val: avgR, label: 'Avg Rating' },
              { icon: IndianRupee, color: 'cyan', val: formatCurrency(user.walletBalance), label: 'Balance' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl p-4 text-center card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500 mx-auto mb-2`} />
                <div className="text-xl font-black">{s.val}</div>
                <div className={`text-xs font-bold ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings & Payouts */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-3xl p-6 card-float ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-sm"><Shield className="w-6 h-6 text-emerald-500" /></div>
                <div><h3 className="font-bold text-lg">Verified Business</h3><p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account active and verified</p></div>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold badge-3d">Verified</span>
            </div>
            
            <div className={`mt-6 pt-6 border-t ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
              <h3 className="font-bold mb-4 text-lg">Payout Details</h3>
              <div className={`p-5 rounded-2xl ${state.darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Linked Bank Account</p>
                    <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Primary payout destination</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition">Manage</button>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl overflow-hidden surface-raised ${state.darkMode ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-white border border-gray-200/80'}`}>
            <div className={`p-5 border-b ${state.darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
              <h3 className="font-bold text-lg">Preferences</h3>
            </div>
            <div className="p-2">
              {[
                { icon: FileText, label: 'Business Documents', desc: 'Manage your KYC and operating licenses' },
                { icon: Settings, label: 'Account Settings', desc: 'Update profile information and notifications' },
                { icon: Shield, label: 'Security', desc: 'Change password and manage 2FA' },
                { icon: HelpCircle, label: 'Help & Support', desc: 'View FAQs and contact support team' },
              ].map((item, i) => (
                <button key={item.label} className={`w-full flex items-center gap-4 p-4 text-left transition-all rounded-2xl ${state.darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <item.icon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1"><p className="font-bold text-sm">{item.label}</p><p className={`text-xs font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</p></div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => dispatch({ type: 'LOGOUT' })} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-red-300 text-red-500 font-bold hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" />Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
