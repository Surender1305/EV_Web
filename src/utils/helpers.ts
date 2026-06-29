import { Station, ConnectorType, TimeSlot } from '../types';

export function getAvailablePorts(station: Station): number {
  return station.connectors.filter(c => c.status === 'available').length;
}

export function getTotalPorts(station: Station): number {
  return station.connectors.length;
}

export function getConnectorColor(type: ConnectorType): string {
  switch (type) {
    case 'CCS': return '#3B82F6';
    case 'CHAdeMO': return '#8B5CF6';
    case 'Type 2': return '#10B981';
    case 'Tesla': return '#EF4444';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return '#10B981';
    case 'occupied': return '#F59E0B';
    case 'out-of-service': return '#EF4444';
    case 'confirmed': return '#3B82F6';
    case 'in-progress': return '#F59E0B';
    case 'completed': return '#10B981';
    case 'cancelled': return '#6B7280';
    default: return '#6B7280';
  }
}

export function generateTimeSlots(date: string, bookedSlots: {startTime: string, endTime: string}[] = []): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const selectedDate = new Date(date + 'T00:00:00');
  const isToday = selectedDate.toDateString() === now.toDateString();

  for (let h = 6; h < 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      const time = `${hour}:${min}`;
      let available = true;

      if (isToday) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) available = false;
      }

      if (available) {
        const slotTimeMin = h * 60 + m;
        for (const b of bookedSlots) {
          const [bh, bm] = b.startTime.split(':').map(Number);
          const [eh, em] = b.endTime.split(':').map(Number);
          const bStart = bh * 60 + bm;
          const bEnd = eh * 60 + em;
          if (slotTimeMin < bEnd && (slotTimeMin + 30) > bStart) {
             available = false;
             break;
          }
        }
      }

      // Randomly make some slots unavailable for realism ONLY if no real bookings were passed
      if (available && bookedSlots.length === 0) {
        const seed = hashCode(`${date}-${time}`);
        if (seed % 5 === 0) available = false;
      }

      slots.push({ time, available });
    }
  }
  return slots;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}
