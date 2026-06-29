import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Station, Booking, User, Transaction, Notification, ConnectorType } from '../types';
import { api } from '../utils/api';

interface Filters {
  connectorTypes: ConnectorType[];
  minPowerKw: number;
  maxPrice: number;
  onlyAvailable: boolean;
  searchQuery: string;
}


interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  stations: Station[];
  bookings: Booking[];
  transactions: Transaction[];
  notifications: Notification[];
  filters: Filters;
  selectedStation: Station | null;
  darkMode: boolean;
  viewMode: 'map' | 'list';
  activeChargingSession: {
    bookingId: string;
    energyDelivered: number;
    elapsed: number;
    cost: number;
    isActive: boolean;
  } | null;
}
type Action =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; bookings: Booking[]; transactions: Transaction[]; notifications: Notification[] } }
  | { type: 'SET_INITIAL_DATA'; payload: { user: User | null; stations: Station[]; bookings: Booking[]; transactions: Transaction[]; notifications: Notification[] } }
  | { type: 'LOGOUT' }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT_STATION'; payload: Station | null }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_VIEW_MODE'; payload: 'map' | 'list' }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'TOP_UP_WALLET'; payload: number }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'START_CHARGING'; payload: string }
  | { type: 'UPDATE_CHARGING'; payload: { energyDelivered: number; elapsed: number; cost: number } }
  | { type: 'STOP_CHARGING'; payload?: { energyDelivered: number; cost: number } }
  | { type: 'ADD_STATION'; payload: Station }
  | { type: 'UPDATE_STATION'; payload: Station }
  | { type: 'DELETE_STATION'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_STATIONS'; payload: Station[] };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  stations: [],
  bookings: [],
  transactions: [],
  notifications: [],
  filters: {
    connectorTypes: [],
    minPowerKw: 0,
    maxPrice: 100,
    onlyAvailable: false,
    searchQuery: '',
  },
  selectedStation: null,
  darkMode: false,
  viewMode: 'map',
  activeChargingSession: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        stations: action.payload.stations,
        bookings: action.payload.bookings,
        transactions: action.payload.transactions,
        notifications: action.payload.notifications,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        bookings: action.payload.bookings,
        transactions: action.payload.transactions,
        notifications: action.payload.notifications,
      };
    case 'LOGOUT':
      api.clearToken();
      return { ...initialState, stations: state.stations, darkMode: state.darkMode };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT_STATION':
      return { ...state, selectedStation: action.payload };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'cancelled' as const } : b
        ),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'TOP_UP_WALLET':
      return {
        ...state,
        user: state.user ? { ...state.user, walletBalance: state.user.walletBalance + action.payload } : null,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'TOGGLE_FAVORITE':
      if (!state.user) return state;
      const favs = state.user.favoriteStations.includes(action.payload)
        ? state.user.favoriteStations.filter(id => id !== action.payload)
        : [...state.user.favoriteStations, action.payload];
      return { ...state, user: { ...state.user, favoriteStations: favs } };
    case 'START_CHARGING':
      return {
        ...state,
        activeChargingSession: {
          bookingId: action.payload,
          energyDelivered: 0,
          elapsed: 0,
          cost: 0,
          isActive: true,
        },
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'in-progress' as const } : b
        ),
      };
    case 'UPDATE_CHARGING':
      return {
        ...state,
        activeChargingSession: state.activeChargingSession
          ? { ...state.activeChargingSession, ...action.payload }
          : null,
      };
    case 'STOP_CHARGING':
      if (!state.activeChargingSession) return state;
      return {
        ...state,
        activeChargingSession: null,
        bookings: state.bookings.map(b =>
          b.id === state.activeChargingSession!.bookingId
            ? {
                ...b,
                status: 'completed' as const,
                energyDelivered: action.payload?.energyDelivered || state.activeChargingSession!.energyDelivered,
              }
            : b
        ),
      };
    case 'ADD_STATION':
      return { ...state, stations: [action.payload, ...state.stations] };
    case 'UPDATE_STATION':
      return {
        ...state,
        stations: state.stations.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_STATION':
      return {
        ...state,
        stations: state.stations.filter(s => s.id !== action.payload),
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_STATIONS':
      return {
        ...state,
        stations: action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  React.useEffect(() => {
    const initData = async () => {
      try {
        const stations = await api.getStations();
        if (api.hasToken()) {
          const [{ user }, bookings, transactions, notifications] = await Promise.all([
            api.getMe(),
            api.getBookings(),
            api.getTransactions(),
            api.getNotifications()
          ]);
          dispatch({ type: 'SET_INITIAL_DATA', payload: { user, stations, bookings, transactions, notifications } });
        } else {
          dispatch({ type: 'SET_INITIAL_DATA', payload: { user: null, stations, bookings: [], transactions: [], notifications: [] } });
        }
      } catch (err) {
        console.error('Failed to initialize data', err);
        api.clearToken();
        const stations = await api.getStations().catch(() => []);
        dispatch({ type: 'SET_INITIAL_DATA', payload: { user: null, stations, bookings: [], transactions: [], notifications: [] } });
      }
    };
    initData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
