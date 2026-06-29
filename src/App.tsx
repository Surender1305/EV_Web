import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';

// Driver pages
import DiscoverPage from './components/DiscoverPage';
import BookingsPage from './components/BookingsPage';
import ChargingPage from './components/ChargingPage';
import WalletPage from './components/WalletPage';
import NotificationsPage from './components/NotificationsPage';
import ProfilePage from './components/ProfilePage';

// Owner pages
import OwnerDashboard from './components/owner/OwnerDashboard';
import MyStations from './components/owner/MyStations';
import OwnerEarnings from './components/owner/OwnerEarnings';
import OwnerProfile from './components/owner/OwnerProfile';

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminStations from './components/admin/AdminStations';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState('');

  const isAdmin = state.user?.role === 'admin';
  const isOwner = state.user?.role === 'owner';

  // Set default page based on role
  useEffect(() => {
    if (state.isAuthenticated && !currentPage) {
      setCurrentPage(isAdmin ? 'admin-dashboard' : isOwner ? 'dashboard' : 'discover');
    }
  }, [state.isAuthenticated, isOwner, isAdmin, currentPage]);

  // Reset page on logout
  useEffect(() => {
    if (!state.isAuthenticated) {
      setCurrentPage('');
    }
  }, [state.isAuthenticated]);

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  const renderDriverPage = () => {
    switch (currentPage) {
      case 'discover': return <DiscoverPage />;
      case 'bookings': return <BookingsPage />;
      case 'charging': return <ChargingPage />;
      case 'wallet': return <WalletPage />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage />;
      default: return <DiscoverPage />;
    }
  };

  const renderOwnerPage = () => {
    switch (currentPage) {
      case 'dashboard': return <OwnerDashboard />;
      case 'stations': return <MyStations />;
      case 'earnings': return <OwnerEarnings />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <OwnerProfile />;
      default: return <OwnerDashboard />;
    }
  };

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-stations': return <AdminStations />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {isAdmin ? renderAdminPage() : isOwner ? renderOwnerPage() : renderDriverPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
