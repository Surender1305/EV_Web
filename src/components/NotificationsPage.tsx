import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { formatDate } from '../utils/helpers';
import { Bell, Calendar, Zap, Tag, Info, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { state, dispatch } = useApp();
  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'charging': return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'promo': return <Tag className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };
  const unread = state.notifications.filter(n => !n.read);
  const read = state.notifications.filter(n => n.read);

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      unread.forEach(n => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id }));
    } catch (err: any) { alert(err.message); }
  };

  const markOne = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-4 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h2 className="text-3xl font-black">Notifications</h2>
          <p className={`text-sm font-medium ${state.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold text-emerald-500 hover:bg-emerald-500/10 transition-all">
            <Check className="w-4 h-4" />Mark all read
          </button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>New</h3>
          <div className="space-y-2 stagger">
            {unread.map(n => (
              <button key={n.id} onClick={() => markOne(n.id)}
                className={`w-full text-left flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all duration-300 card-float
                  ${state.darkMode ? 'bg-gray-800/80 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-emerald-50/50 border-emerald-200/60 hover:border-emerald-300'}`}>
                <div className="mt-0.5 p-1.5 rounded-xl bg-white/80 dark:bg-gray-700 shadow-sm">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{n.title}</h4>
                  <p className={`text-sm mt-0.5 ${state.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                  <p className={`text-xs mt-1.5 font-medium ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(n.createdAt)}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 flex-shrink-0 shadow-lg shadow-emerald-500/40 animate-pulse" />
              </button>
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h3 className={`text-xs font-black uppercase tracking-widest mb-3 ${state.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Earlier</h3>
          <div className="space-y-2">
            {read.map(n => (
              <div key={n.id} className={`flex items-start gap-3.5 p-4 rounded-2xl ${state.darkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/60 border border-gray-200/50'}`}>
                <div className="mt-0.5 opacity-50">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${state.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{n.title}</h4>
                  <p className={`text-sm mt-0.5 ${state.darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{n.message}</p>
                  <p className={`text-xs mt-1.5 font-medium ${state.darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{formatDate(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.notifications.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-gray-200/50 dark:bg-gray-800 mx-auto flex items-center justify-center mb-5"><Bell className="w-10 h-10 text-gray-300" /></div>
          <h3 className="text-xl font-bold mb-2">All caught up!</h3>
        </div>
      )}
    </div>
  );
}
