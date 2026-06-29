const API_URL = '/api';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: any) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Stations
  getStations: () => request('/stations'),
  addStation: (station: any) => request('/stations', { method: 'POST', body: JSON.stringify(station) }),
  updateStation: (id: string, station: any) => request(`/stations/${id}`, { method: 'PUT', body: JSON.stringify(station) }),
  deleteStation: (id: string) => request(`/stations/${id}`, { method: 'DELETE' }),
  getStationBookings: (id: string) => request<any[]>(`/stations/${id}/bookings`),

  // Bookings
  getBookings: () => request('/bookings'),
  createBooking: (booking: any) => request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  cancelBooking: (id: string) => request(`/bookings/${id}/cancel`, { method: 'POST' }),
  startCharging: (id: string) => request(`/bookings/${id}/start-charging`, { method: 'POST' }),
  stopCharging: (id: string, data: any) => request(`/bookings/${id}/stop-charging`, { method: 'POST', body: JSON.stringify(data) }),
  emergencyOverride: (data: { stationId: string, connectorId: string }) => request('/bookings/emergency-override', { method: 'POST', body: JSON.stringify(data) }),

  // Wallet
  getTransactions: () => request('/transactions'),
  topUpWallet: (amount: number) => request('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
  createRazorpayOrder: (amount: number) => request<any>('/wallet/create-razorpay-order', { method: 'POST', body: JSON.stringify({ amount }) }),
  verifyRazorpayPayment: (data: any) => request<any>('/wallet/verify-razorpay-payment', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Favorites
  toggleFavorite: (stationId: string) => request('/users/favorite', { method: 'POST', body: JSON.stringify({ stationId }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),

  // Public
  getPublicStats: () => request('/public/stats'),

  // Auth Helpers
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),
  hasToken: () => !!localStorage.getItem('token')
};
