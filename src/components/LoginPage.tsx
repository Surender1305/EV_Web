import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Zap, Mail, Phone, Globe, ArrowRight, Eye, EyeOff, User, Building2, ArrowLeft, Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { state, dispatch } = useApp();
  const [role, setRole] = useState<'driver' | 'owner' | 'admin' | 'emergency' | null>(null);
  const [method, setMethod] = useState<'email' | 'phone' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalStations: 0, activeSessions: 0 });

  useEffect(() => {
    if (!role) {
      api.getPublicStats()
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch public stats', err));
    }
  }, [role]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      let data;
      if (isSignUp) {
        data = await api.register({
          name,
          email,
          password,
          phone,
          role: role || 'driver'
        });
      } else {
        if (method === 'email') {
          data = await api.login({ email, password, role: role || 'driver' });
        } else {
          data = await api.login({ phone, otp, role: role || 'driver' });
        }
      }
      api.setToken(data.token);
      
      const [bookings, transactions, notifications] = await Promise.all([
        api.getBookings(),
        api.getTransactions(),
        api.getNotifications()
      ]);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: data.user, bookings, transactions, notifications } 
      });
    } catch (err: any) {
      alert(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetToRoleSelect = () => {
    setRole(null);
    setMethod(null);
    setOtpSent(false);
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
    setIsForgotPassword(false);
    setNewPassword('');
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      if (password !== newPassword) {
        alert("Passwords do not match");
        return;
      }
      await api.resetPassword({ email, newPassword, role: role || 'driver' });
      alert("Password reset successful. You can now login.");
      setIsForgotPassword(false);
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };


  const inputClass = `w-full px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4
    ${state.darkMode
      ? 'bg-gray-800/80 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/10'
      : 'bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'}`;

  // ─── ROLE SELECTION ──────────────────────
  if (!role) {
    return (
      <div className={`min-h-screen flex overflow-hidden ${state.darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-emerald-50/30'}`}>
        {/* Decorative bg orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-3xl animate-rotate-slow" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-400/5 blur-3xl" />
        </div>

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-cyan-300/20 blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
          </div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-10 shadow-2xl border border-white/20 animate-float overflow-hidden p-2">
              <img src="/logo.png" alt="EV Link Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              EV Charging<br />Made Simple<br /><span className="text-emerald-200">in Pondy</span>
            </h2>
            <p className="text-xl text-white/70 max-w-md leading-relaxed">
              Find stations, book slots, and charge your EV — all from one sleek app.
            </p>
            <div className="mt-14 flex gap-8">
              {[
                { n: `${stats.totalStations}`, l: 'Live Stations' }, 
                { n: `${stats.totalUsers}`, l: 'Live Users' }, 
                { n: `${stats.activeSessions}`, l: 'Active Sessions' }
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-4xl font-black">{s.n}</div>
                  <div className="text-sm text-white/50 mt-1 font-medium">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md animate-slide-up">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <img src="/logo.png" alt="EV Link Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">EV Link</h1>
                <p className={`text-xs ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Puducherry</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className={`text-xs font-semibold ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose your role</span>
            </div>
            <h2 className={`text-3xl font-black mb-1 tracking-tight ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome!</h2>
            <p className={`mb-6 text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>How will you use EV Link?</p>

            <div className="space-y-3 stagger">
              {/* Driver Card */}
              <button
                onClick={() => { setRole('driver'); setMethod('email'); setEmail('arun.kumar@email.com'); }}
                className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-500 group card-3d
                  ${state.darkMode
                    ? 'border-gray-800 bg-gray-900/80 hover:border-emerald-500/60'
                    : 'border-gray-200 bg-white hover:border-emerald-400'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow group-hover:scale-110 duration-500">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-0.5">EV Owner / Driver</h3>
                    <p className={`text-xs leading-relaxed ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Find stations, book slots, live charging sessions & wallet
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-emerald-500 font-semibold text-xs opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Continue as Driver <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              {/* Owner Card */}
              <button
                onClick={() => { setRole('owner'); setMethod('email'); setEmail('owner@greencharge.in'); }}
                className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-500 group card-3d
                  ${state.darkMode
                    ? 'border-gray-800 bg-gray-900/80 hover:border-blue-500/60'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow group-hover:scale-110 duration-500">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-0.5">Station Owner</h3>
                    <p className={`text-xs leading-relaxed ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Add & manage stations, track bookings, analytics & earnings
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Continue as Owner <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              {/* Admin Card */}
              <button
                onClick={() => { setRole('admin'); setMethod('email'); setEmail('admin@chargefinder.com'); }}
                className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-500 group card-3d
                  ${state.darkMode
                    ? 'border-gray-800 bg-gray-900/80 hover:border-teal-500/60'
                    : 'border-gray-200 bg-white hover:border-teal-400'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow group-hover:scale-110 duration-500">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-0.5">System Admin</h3>
                    <p className={`text-xs leading-relaxed ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Platform overview, user management & global analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-teal-600 font-semibold text-xs opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Continue as Admin <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              {/* Emergency Card */}
              <button
                onClick={() => { setRole('emergency'); setMethod('email'); setEmail('responder@emergency.in'); }}
                className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-500 group card-3d
                  ${state.darkMode
                    ? 'border-gray-800 bg-gray-900/80 hover:border-blue-500/60'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow group-hover:scale-110 duration-500">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-0.5">Emergency Responder</h3>
                    <p className={`text-xs leading-relaxed ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Priority override, free charging & critical alerts
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3 text-blue-600 font-semibold text-xs opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  Continue as Responder <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <Shield className="w-4 h-4 text-gray-400" />
              <p className={`text-xs ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                256-bit encrypted · Privacy first · Made in Puducherry
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTH FORM ──────────────────────
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isEmergency = role === 'emergency';
  
  const gradientFrom = isAdmin ? 'from-blue-500' : isOwner ? 'from-purple-500' : isEmergency ? 'from-red-500' : 'from-emerald-500';
  const gradientTo = isAdmin ? 'to-indigo-500' : isOwner ? 'to-pink-500' : isEmergency ? 'to-rose-500' : 'to-cyan-500';
  const gradientFull = isAdmin ? 'from-blue-600 via-indigo-600 to-purple-700' : isOwner ? 'from-purple-600 via-purple-700 to-pink-600' : isEmergency ? 'from-red-600 via-rose-600 to-pink-700' : 'from-emerald-600 via-teal-600 to-cyan-700';
  const accentText = isAdmin ? 'text-blue-500' : isOwner ? 'text-purple-500' : isEmergency ? 'text-red-500' : 'text-emerald-500';

  return (
    <div className={`min-h-screen flex overflow-hidden ${state.darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full ${isAdmin ? 'bg-blue-400/10' : isOwner ? 'bg-purple-400/10' : isEmergency ? 'bg-red-400/10' : 'bg-emerald-400/10'} blur-3xl`} />
        <div className={`absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full ${isAdmin ? 'bg-indigo-400/10' : isOwner ? 'bg-pink-400/10' : isEmergency ? 'bg-rose-400/10' : 'bg-cyan-400/10'} blur-3xl`} />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFull}`} />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-10 shadow-2xl border border-white/20 animate-float overflow-hidden p-2">
            <img src="/logo.png" alt="EV Link Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
            {isAdmin ? <>Platform<br />Admin<br /><span className="text-blue-200">Dashboard</span></> : isOwner ? <>Manage Your<br />Charging<br /><span className="text-purple-200">Business</span></> : isEmergency ? <>Emergency<br />Response<br /><span className="text-red-200">Network</span></> : <>Find & Book<br />EV Charging<br /><span className="text-emerald-200">Stations</span></>}
          </h2>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            {isAdmin ? 'Monitor system health, manage users, and view platform analytics.' : isOwner ? 'Add stations, manage bookings, and grow your EV business in Puducherry.' : isEmergency ? 'Immediate priority access to charging infrastructure for critical response.' : 'Discover stations, check live availability, and book charging slots instantly.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          <button
            onClick={resetToRoleSelect}
            className={`flex items-center gap-2 mb-8 text-sm font-medium transition group ${state.darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Change account type
          </button>

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="EV Link Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className={`text-xl font-black bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>EV Link Pondy</h1>
              <p className={`text-xs ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{isAdmin ? 'Admin Portal' : isOwner ? 'Business Portal' : isEmergency ? 'Emergency Response' : 'Driver App'}</p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold mb-5 badge-3d ${isAdmin ? 'bg-blue-500/10 text-blue-500' : isOwner ? 'bg-purple-500/10 text-purple-500' : isEmergency ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {isAdmin ? <Shield className="w-3.5 h-3.5" /> : isOwner ? <Building2 className="w-3.5 h-3.5" /> : isEmergency ? <Zap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            {isAdmin ? 'PLATFORM ADMIN' : isOwner ? 'STATION OWNER' : isEmergency ? 'EMERGENCY' : 'EV DRIVER'}
          </div>

          <h2 className={`text-3xl font-black mb-2 tracking-tight ${state.darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isForgotPassword ? 'Reset Password' : isSignUp ? (isOwner ? 'Owner Sign Up' : 'Create an Account') : (isOwner ? 'Owner Sign In' : 'Welcome back')}
          </h2>
          <p className={`mb-8 ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isForgotPassword ? 'Enter your email and new password to reset' : isSignUp ? (isOwner ? 'Register your station management account' : 'Sign up to find and book charging stations') : (isOwner ? 'Access your station management dashboard' : 'Sign in to find and book charging stations')}
          </p>



          {method === 'email' && (
            <div className="space-y-4 animate-slide-up">
              {isForgotPassword ? (
                <>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`block text-sm font-semibold ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`block text-sm font-semibold ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleResetPassword} disabled={loading} className={`w-full py-4 rounded-2xl bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 animate-gradient`}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setIsForgotPassword(false)} className={`text-sm font-medium ${accentText} hover:underline`}>← Back to Login</button>
                  </div>
                </>
              ) : (
                <>
                  {isSignUp && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="John Doe" />
                    </div>
                  )}
                  {isSignUp && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 00000" />
                    </div>
                  )}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`block text-sm font-semibold ${state.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                      {!isSignUp && (
                        <button 
                          onClick={() => setIsForgotPassword(true)} 
                          className={`text-xs font-semibold ${accentText} hover:underline`}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAuth} disabled={loading} className={`w-full py-4 rounded-2xl bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 animate-gradient`}>
                    {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </button>
                  
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setMethod(null)} className={`text-sm font-medium ${accentText} hover:underline`}>← Back</button>
                    <button onClick={() => setIsSignUp(!isSignUp)} className={`text-sm font-medium ${state.darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                      {isSignUp ? 'Already have an account? Sign In' : 'New here? Sign Up'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}



          <div className="flex items-center justify-center gap-2 mt-10">
            <Shield className="w-4 h-4 text-gray-400" />
            <p className={`text-xs ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              Secured with SSL · Terms of Service · Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
