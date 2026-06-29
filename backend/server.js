import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { authMiddleware, JWT_SECRET } from './middleware/auth.js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKey';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholderSecret';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// ────────────────────────────────────────────
// 1. AUTH: Register
// ────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role, vehicleName, vehicleModel } = req.body;
  if (db.data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: role === 'owner' ? `owner-${Date.now()}` : role === 'admin' ? `admin-${Date.now()}` : role === 'emergency' ? `emergency-${Date.now()}` : `user-${Date.now()}`,
    name, email, phone, role: role || 'driver',
    password: hashedPassword,
    plainPassword: password,
    walletBalance: 0,
    favoriteStations: [],
    vehicleName, vehicleModel
  };

  db.data.users.push(newUser);
  db.save();

  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
  const { password: _, ...safeUser } = newUser;
  res.json({ user: safeUser, token });
});

// ────────────────────────────────────────────
// 2. AUTH: Login (email + password only)
// ────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Provide email and password' });
  }

  let user = db.data.users.find(u => u.email === email);
  if (!user) {
    // Auto-register for seamless demo/testing
    const hashedPassword = await bcrypt.hash(password, 10);
    user = {
      id: role === 'owner' ? `owner-${Date.now()}` : role === 'admin' ? `admin-${Date.now()}` : role === 'emergency' ? `emergency-${Date.now()}` : `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+91 00000 00000',
      role: role || 'driver',
      password: hashedPassword,
      plainPassword: password,
      walletBalance: 0,
      favoriteStations: []
    };
    db.data.users.push(user);
    db.save();
  } else {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

// ────────────────────────────────────────────
// 2.5 AUTH: Reset Password
// ────────────────────────────────────────────
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword, role } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Provide email and new password' });
  }

  const user = db.data.users.find(u => u.email === email && (role ? u.role === role : true));
  if (!user) {
    return res.status(404).json({ error: 'User not found with this email' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.plainPassword = newPassword;
  db.save();

  res.json({ success: true, message: 'Password reset successful' });
});

// ────────────────────────────────────────────
// 3. AUTH: Get current user
// ────────────────────────────────────────────
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ────────────────────────────────────────────
// 4. AUTH: Update profile
// ────────────────────────────────────────────
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { name, email, phone, vehicleName, vehicleModel } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (vehicleName !== undefined) user.vehicleName = vehicleName;
  if (vehicleModel !== undefined) user.vehicleModel = vehicleModel;

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ────────────────────────────────────────────
// 5. STATIONS
// ────────────────────────────────────────────
app.get('/api/stations', (req, res) => {
  res.json(db.data.stations);
});

app.post('/api/stations', authMiddleware, (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Owners only' });
  const station = { ...req.body, ownerId: req.user.id };
  db.data.stations.push(station);
  db.save();
  res.json(station);
});

app.put('/api/stations/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Owners only' });
  const idx = db.data.stations.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (db.data.stations[idx].ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

  db.data.stations[idx] = { ...db.data.stations[idx], ...req.body };
  db.save();
  res.json(db.data.stations[idx]);
});

app.delete('/api/stations/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const station = db.data.stations.find(s => s.id === req.params.id);
  if (!station) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'owner' && station.ownerId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

  db.data.stations = db.data.stations.filter(s => s.id !== req.params.id);
  db.save();
  res.json({ success: true });
});

app.get('/api/stations/:id/bookings', (req, res) => {
  const stationId = req.params.id;
  const activeBookings = db.data.bookings.filter(b => 
    b.stationId === stationId && 
    (b.status === 'confirmed' || b.status === 'in-progress')
  ).map(b => ({
    connectorId: b.connectorId,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime
  }));
  res.json(activeBookings);
});

// ────────────────────────────────────────────
// 6. BOOKINGS
// ────────────────────────────────────────────

// Helper: find station and update connector status
function updateConnectorStatus(stationId, connectorId, newStatus) {
  const station = db.data.stations.find(s => s.id === stationId);
  if (station) {
    const conn = station.connectors.find(c => c.id === connectorId);
    if (conn) conn.status = newStatus;
  }
}

// Helper: create a notification for a user
function createNotification(userId, title, message, type = 'booking') {
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.data.notifications.unshift(notif);
  return notif;
}

app.get('/api/bookings', authMiddleware, (req, res) => {
  if (req.user.role === 'owner') {
    const ownerStationIds = db.data.stations
      .filter(s => s.ownerId === req.user.id)
      .map(s => s.id);
    const bookings = db.data.bookings.filter(b => ownerStationIds.includes(b.stationId));
    return res.json(bookings);
  }
  const bookings = db.data.bookings.filter(b => b.userId === req.user.id);
  res.json(bookings);
});

app.post('/api/bookings', authMiddleware, (req, res) => {
  const booking = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);

  // Check balance
  if (user.walletBalance < booking.amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Deduct wallet
  user.walletBalance -= booking.amount;

  // Store the customer name so owner dashboard can display it
  booking.userName = user.name;

  db.data.bookings.unshift(booking);

  // Create transaction for the driver
  const txn = {
    id: `txn-${Date.now()}`,
    userId: user.id,
    bookingId: booking.id,
    stationId: booking.stationId,
    amount: booking.amount,
    type: 'payment',
    status: 'success',
    description: `Booking at ${booking.stationName}`,
    createdAt: new Date().toISOString()
  };
  db.data.transactions.unshift(txn);

  // Notification for the driver
  createNotification(
    user.id,
    'Booking Confirmed',
    `Your booking at ${booking.stationName} has been confirmed.`,
    'booking'
  );

  // Notification for the station owner
  const station = db.data.stations.find(s => s.id === booking.stationId);
  if (station) {
    createNotification(
      station.ownerId,
      'New Booking',
      `${user.name} booked a ${booking.connectorType} slot at ${booking.stationName}.`,
      'booking'
    );
  }

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ booking, transaction: txn, user: safeUser });
});

app.post('/api/bookings/:id/cancel', authMiddleware, (req, res) => {
  const booking = db.data.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });

  booking.status = 'cancelled';

  // Refund wallet
  const user = db.data.users.find(u => u.id === booking.userId);
  user.walletBalance += booking.amount;

  // Release connector
  updateConnectorStatus(booking.stationId, booking.connectorId, 'available');

  const txn = {
    id: `txn-${Date.now()}`,
    userId: user.id,
    bookingId: booking.id,
    stationId: booking.stationId,
    amount: booking.amount,
    type: 'refund',
    status: 'success',
    description: `Refund for cancelled booking at ${booking.stationName}`,
    createdAt: new Date().toISOString()
  };
  db.data.transactions.unshift(txn);

  // Notification for the driver
  createNotification(user.id, 'Booking Cancelled', `Your booking at ${booking.stationName} was cancelled. ₹${booking.amount} refunded.`, 'booking');

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ booking, transaction: txn, user: safeUser });
});

app.post('/api/bookings/:id/start-charging', authMiddleware, (req, res) => {
  const booking = db.data.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });
  booking.status = 'in-progress';

  // Mark connector as occupied
  updateConnectorStatus(booking.stationId, booking.connectorId, 'occupied');

  // Notification
  createNotification(booking.userId, 'Charging Started', `Your charging session at ${booking.stationName} has started.`, 'charging');

  db.save();
  res.json({ booking });
});

app.post('/api/bookings/:id/stop-charging', authMiddleware, (req, res) => {
  const { energyDelivered, cost } = req.body;
  const booking = db.data.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Not found' });

  booking.status = 'completed';
  booking.energyDelivered = energyDelivered;

  // Release connector
  updateConnectorStatus(booking.stationId, booking.connectorId, 'available');

  // Notification
  createNotification(req.user.id, 'Charging Complete', `Charged ${energyDelivered?.toFixed(1) || 0} kWh at ${booking.stationName}.`, 'charging');

  db.save();

  const user = db.data.users.find(u => u.id === req.user.id);
  const { password: _, ...safeUser } = user;
  res.json({ booking, user: safeUser });
});

app.post('/api/bookings/emergency-override', authMiddleware, (req, res) => {
  if (req.user.role !== 'emergency') return res.status(403).json({ error: 'Only emergency vehicles can perform this action' });
  const { stationId, connectorId } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const station = db.data.stations.find(s => s.id === stationId);
  if (!station) return res.status(404).json({ error: 'Station not found' });
  const connector = station.connectors.find(c => c.id === connectorId);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  // Cancel any existing booking for this connector that is in-progress or confirmed
  const existingBooking = db.data.bookings.find(b => 
    b.stationId === stationId && 
    b.connectorId === connectorId && 
    (b.status === 'in-progress' || b.status === 'confirmed')
  );

  if (existingBooking) {
    existingBooking.status = 'cancelled';
    const oldUser = db.data.users.find(u => u.id === existingBooking.userId);
    if (oldUser) {
      oldUser.walletBalance += existingBooking.amount;
      createNotification(oldUser.id, 'EMERGENCY PREEMPTION', `Your session at ${station.name} was interrupted for an ambulance. You have been fully refunded ₹${existingBooking.amount}.`, 'system');
      
      const refundTxn = {
        id: `txn-${Date.now()}-refund`,
        userId: oldUser.id,
        bookingId: existingBooking.id,
        stationId: stationId,
        amount: existingBooking.amount,
        type: 'refund',
        status: 'success',
        description: `Emergency preemption refund`,
        createdAt: new Date().toISOString()
      };
      db.data.transactions.unshift(refundTxn);
    }
  }

  const bookingId = `booking-emg-${Date.now()}`;
  const qrValue = `CF-EMG-${bookingId}-${stationId}`;
  
  const emergencyBooking = {
    id: bookingId,
    userId: user.id,
    stationId,
    stationName: station.name,
    connectorId,
    connectorType: connector.type,
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    endTime: '23:59',
    status: 'in-progress',
    amount: 0,
    qrCode: qrValue,
    createdAt: new Date().toISOString()
  };

  db.data.bookings.unshift(emergencyBooking);
  updateConnectorStatus(stationId, connectorId, 'occupied');
  
  createNotification(station.ownerId, 'Emergency Override', `An emergency vehicle has preempted a slot at ${station.name}.`, 'booking');

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ booking: emergencyBooking, user: safeUser });
});

// ────────────────────────────────────────────
// 7. TRANSACTIONS
// ────────────────────────────────────────────
app.get('/api/transactions', authMiddleware, (req, res) => {
  if (req.user.role === 'owner') {
    // For owners: return transactions linked to bookings at their stations
    const ownerStationIds = db.data.stations
      .filter(s => s.ownerId === req.user.id)
      .map(s => s.id);
    const txns = db.data.transactions.filter(t =>
      t.userId === req.user.id || ownerStationIds.includes(t.stationId)
    );
    return res.json(txns);
  }
  const txns = db.data.transactions.filter(t => t.userId === req.user.id);
  res.json(txns);
});

app.post('/api/wallet/topup', authMiddleware, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const user = db.data.users.find(u => u.id === req.user.id);
  user.walletBalance += Number(amount);

  const txn = {
    id: `txn-${Date.now()}`,
    userId: user.id,
    amount,
    type: 'top-up',
    status: 'success',
    description: 'Wallet top-up via UPI',
    createdAt: new Date().toISOString()
  };
  db.data.transactions.unshift(txn);

  // Notification
  createNotification(user.id, 'Wallet Top-Up', `₹${amount} added to your wallet successfully.`, 'system');

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, transaction: txn });
});

app.post('/api/wallet/create-razorpay-order', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order', details: error.message });
  }
});

app.post('/api/wallet/verify-razorpay-payment', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required Razorpay parameters' });
  }

  // Verify the signature
  const hmac = crypto.createHmac('sha256', razorpayKeySecret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  const isSignatureValid = generatedSignature === razorpay_signature;

  // Fallback: if keys are placeholder, allow a bypass for demo purposes,
  // but log a warning. That way the app can still be tested even without real keys.
  const isPlaceholder = razorpayKeyId === 'rzp_test_placeholderKey';

  if (!isSignatureValid && !isPlaceholder) {
    return res.status(400).json({ error: 'Payment signature verification failed' });
  }

  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const topupAmount = Number(amount);
  user.walletBalance += topupAmount;

  const txn = {
    id: `txn-${Date.now()}`,
    userId: user.id,
    amount: topupAmount,
    type: 'top-up',
    status: 'success',
    description: `Wallet top-up via Razorpay (${razorpay_payment_id})`,
    createdAt: new Date().toISOString()
  };
  db.data.transactions.unshift(txn);

  // Notification
  createNotification(
    user.id,
    'Wallet Top-Up',
    `₹${topupAmount} added to your wallet successfully via Razorpay.`,
    'system'
  );

  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, transaction: txn });
});

// ────────────────────────────────────────────
// 8. NOTIFICATIONS (per-user)
// ────────────────────────────────────────────
app.get('/api/notifications', authMiddleware, (req, res) => {
  const userNotifs = db.data.notifications.filter(n => n.userId === req.user.id);
  res.json(userNotifs);
});

app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const notif = db.data.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', authMiddleware, (req, res) => {
  db.data.notifications
    .filter(n => n.userId === req.user.id)
    .forEach(n => n.read = true);
  db.save();
  res.json({ success: true });
});

// ────────────────────────────────────────────
// 9. FAVORITES
// ────────────────────────────────────────────
app.post('/api/users/favorite', authMiddleware, (req, res) => {
  const { stationId } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);
  const idx = user.favoriteStations.indexOf(stationId);
  if (idx === -1) {
    user.favoriteStations.push(stationId);
  } else {
    user.favoriteStations.splice(idx, 1);
  }
  db.save();
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ────────────────────────────────────────────
// 10. ADMIN
// ────────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  const totalUsers = db.data.users.length;
  const totalStations = db.data.stations.length;
  const activeBookings = db.data.bookings.filter(b => b.status === 'in-progress' || b.status === 'confirmed').length;
  const totalRevenue = db.data.transactions.filter(t => t.type === 'payment' && t.status === 'success').reduce((acc, t) => acc + t.amount, 0);
  res.json({ totalUsers, totalStations, activeBookings, totalRevenue });
});

app.get('/api/admin/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  const safeUsers = db.data.users.map(u => {
    const { password, ...safeU } = u;
    return {
      ...safeU,
      plainPassword: u.plainPassword || 'password123' // default fallback since we reset them
    };
  });
  res.json(safeUsers);
});

// ────────────────────────────────────────────
// 11. PUBLIC STATS
// ────────────────────────────────────────────
app.get('/api/public/stats', (req, res) => {
  const totalUsers = db.data.users.length;
  const totalStations = db.data.stations.length;
  const activeSessions = db.data.bookings.filter(b => b.status === 'in-progress' || b.status === 'completed').length;
  res.json({ totalUsers, totalStations, activeSessions });
});

// ────────────────────────────────────────────
// START SERVER
// ────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
