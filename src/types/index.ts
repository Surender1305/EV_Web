export type ConnectorType = 'CCS' | 'CHAdeMO' | 'Type 2' | 'Tesla';
export type BookingStatus = 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
export type PortStatus = 'available' | 'occupied' | 'out-of-service';

export interface Connector {
  id: string;
  type: ConnectorType;
  powerKw: number;
  status: PortStatus;
  currentBookingId?: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  connectors: Connector[];
  pricePerKwh: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amenities: string[];
  operatingHours: string;
  ownerId: string;
  distance?: number;
}

export interface Booking {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  connectorId: string;
  connectorType: ConnectorType;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
  qrCode: string;
  energyDelivered?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'driver' | 'owner' | 'admin';
  avatarUrl?: string;
  vehicleName?: string;
  vehicleModel?: string;
  walletBalance: number;
  favoriteStations: string[];
  plainPassword?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  amount: number;
  type: 'payment' | 'refund' | 'top-up';
  status: 'success' | 'pending' | 'failed';
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'charging' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
