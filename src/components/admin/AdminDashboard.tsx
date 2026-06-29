import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { Users, Building2, Calendar, IndianRupee, Activity, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStations: number;
  activeBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { state } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Stations', value: stats?.totalStations || 0, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Platform Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Platform Overview
        </h2>
        <p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Monitor key metrics and system activity across ChargeFinder.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-3xl border ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </div>
            <div className="text-2xl font-bold mt-1">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className={`p-6 rounded-3xl border ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">System Status</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className={`text-sm font-medium ${state.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            All services operating normally
          </span>
        </div>
      </div>
    </div>
  );
}
