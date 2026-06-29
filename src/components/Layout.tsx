import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User, Calendar, Zap, Bell, LogOut, Sun, Moon, Wallet, Menu, X, Home,
  Building2, IndianRupee, LayoutDashboard, Users, Shield,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { state, dispatch } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const isOwner = state.user?.role === 'owner';
  const isAdmin = state.user?.role === 'admin';
  const isEmergency = state.user?.role === 'emergency';

  const driverNavItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  const ownerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stations', label: 'Stations', icon: Building2 },
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-stations', label: 'Stations', icon: Building2 },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  const navItems = isAdmin ? adminNavItems : isOwner ? ownerNavItems : driverNavItems;
  if (!isOwner && !isAdmin && state.activeChargingSession) {
    navItems.splice(2, 0, { id: 'charging', label: 'Charging', icon: Zap, badge: 0 });
  }

  return (
    <div className={`min-h-screen ${state.darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50/80 text-gray-900'}`}>
      {/* Subtle background mesh */}
      <div className={`fixed inset-0 pointer-events-none ${isAdmin ? 'gradient-mesh-blue' : isOwner ? 'gradient-mesh-purple' : isEmergency ? 'gradient-mesh-red' : 'gradient-mesh'} opacity-60`} />

      {/* ─── HEADER ─── */}
      <header className={`sticky top-0 z-50 ${state.darkMode ? 'glass-dark' : 'glass-light'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : isOwner ? 'dashboard' : 'discover')}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-white group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="EV Link Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className={`text-lg font-black bg-gradient-to-r ${isAdmin ? 'from-blue-700 to-teal-400' : isOwner ? 'from-blue-700 to-teal-400' : isEmergency ? 'from-blue-700 to-teal-400' : 'from-blue-700 to-teal-400'} bg-clip-text text-transparent`}>
                EV Link
              </h1>
              <p className={`text-[10px] -mt-0.5 font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {isAdmin ? 'Admin' : isOwner ? 'Business · Pondy' : isEmergency ? 'Emergency · Pondy' : 'Pondy'}
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2
                    ${active
                      ? `${isAdmin ? 'bg-blue-500/10 text-blue-500 shadow-sm' : isOwner ? 'bg-blue-600/10 text-blue-600 shadow-sm' : isEmergency ? 'bg-blue-600/10 text-blue-600 shadow-sm' : 'bg-blue-600/10 text-blue-600 shadow-sm'}`
                      : state.darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
                    }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? 'drop-shadow-sm' : ''}`} />
                  {item.label}
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 animate-bounce-in">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className={`p-2.5 rounded-2xl transition-all duration-300 ${state.darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-yellow-400' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'}`}
            >
              {state.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => dispatch({ type: 'LOGOUT' })} className={`hidden md:flex p-2.5 rounded-2xl transition ${state.darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-red-400' : 'text-gray-500 hover:bg-black/5 hover:text-blue-600'}`} title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-2xl">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t animate-slide-up ${state.darkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-xl`}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition
                    ${currentPage === item.id
                      ? isAdmin ? 'bg-blue-500/10 text-blue-500' : isOwner ? 'bg-blue-600/10 text-blue-600' : isEmergency ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-600/10 text-blue-600'
                      : state.darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5'
                    }`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                  {item.badge ? <span className="ml-auto w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{item.badge}</span> : null}
                </button>
              ))}
              <button onClick={() => { dispatch({ type: 'LOGOUT' }); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-blue-600 hover:bg-blue-600/10 transition">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto relative z-10">{children}</main>

      {/* ─── BOTTOM NAV (Mobile) ─── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${state.darkMode ? 'glass-dark border-gray-800' : 'glass-light border-gray-200'}`}>
        <div className="flex items-center justify-around py-1.5 px-1">
          {navItems.slice(0, 5).map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-300
                  ${active ? `${isAdmin ? 'text-blue-500' : isOwner ? 'text-blue-600' : isEmergency ? 'text-blue-600' : 'text-blue-600'} scale-110` : state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                {active && <div className={`absolute -top-1.5 w-8 h-1 rounded-full ${isAdmin ? 'bg-blue-500' : isOwner ? 'bg-blue-600' : isEmergency ? 'bg-blue-600' : 'bg-blue-600'} shadow-lg`} />}
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.label}</span>
                {item.badge ? <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40">{item.badge}</span> : null}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
