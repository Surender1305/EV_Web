import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { User } from '../../types';
import { Users, Shield, Zap, Building2, Search } from 'lucide-react';

export default function AdminUsers() {
  const { state } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className={`text-sm ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            View and manage all registered users on the platform.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-200'}`}>
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
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
        <div className={`rounded-3xl border overflow-hidden ${state.darkMode ? 'glass-dark border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className={`text-xs uppercase ${state.darkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Phone</th>
                  <th className="px-6 py-4 font-bold">Password (Demo)</th>
                  <th className="px-6 py-4 font-bold">Wallet Balance</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`transition-colors ${state.darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-blue-500/10 text-blue-500' : user.role === 'owner' ? 'bg-purple-500/10 text-purple-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {user.role === 'admin' ? <Shield className="w-5 h-5" /> : user.role === 'owner' ? <Building2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className={`text-xs ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                        user.role === 'owner' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{user.phone}</td>
                    <td className="px-6 py-4 font-mono text-xs">{user.plainPassword}</td>
                    <td className="px-6 py-4 font-bold text-emerald-500">₹{user.walletBalance}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={async () => {
                          const newPassword = prompt(`Enter new password for ${user.name}:`, 'password123');
                          if (!newPassword) return;
                          try {
                            await api.resetPassword({ email: user.email, newPassword, role: user.role });
                            alert('Password reset successfully!');
                            // Refresh list
                            const data = await api.getAdminUsers();
                            setUsers(data);
                          } catch (err: any) {
                            alert(err.message || 'Failed to reset password');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition`}
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
