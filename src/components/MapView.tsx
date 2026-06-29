import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Station } from '../types';
import { getAvailablePorts, getTotalPorts } from '../utils/helpers';
import { useApp } from '../context/AppContext';

interface MapViewProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
  selectedStation: Station | null;
}

function createCustomIcon(available: number, total: number, isSelected: boolean) {
  const ratio = total > 0 ? available / total : 0;
  const color = ratio > 0.5 ? '#10B981' : ratio > 0 ? '#F59E0B' : '#EF4444';
  const size = isSelected ? 48 : 40;

  const glow = isSelected ? `filter: brightness(1.15); box-shadow: 0 0 30px ${color}80, 0 6px 20px rgba(0,0,0,0.35);` : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: linear-gradient(135deg, ${color}, ${color}dd);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 20px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.25);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s ease;
        ${glow}
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 900;
          font-size: ${isSelected ? '15' : '13'}px;
          font-family: system-ui;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">${available}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

export default function MapView({ stations, onStationSelect, selectedStation }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useApp();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView([11.9416, 79.8083], 13);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileUrl = state.darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer when dark mode changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });
    
    const tileUrl = state.darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OSM &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current);
  }, [state.darkMode]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    stations.forEach(station => {
      const available = getAvailablePorts(station);
      const total = getTotalPorts(station);
      const isSelected = selectedStation?.id === station.id;

      const marker = L.marker([station.lat, station.lng], {
        icon: createCustomIcon(available, total, isSelected),
      }).addTo(mapRef.current!);

      marker.bindTooltip(
        `<div style="font-family: system-ui; padding: 4px 0;">
          <strong>${station.name}</strong><br/>
          <span style="color: ${available > 0 ? '#10B981' : '#EF4444'}">${available}/${total} available</span>
          <span style="margin-left: 8px;">$${station.pricePerKwh}/kWh</span>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.on('click', () => {
        onStationSelect(station);
      });

      markersRef.current.push(marker);
    });
  }, [stations, selectedStation, onStationSelect]);

  useEffect(() => {
    if (selectedStation && mapRef.current) {
      mapRef.current.flyTo([selectedStation.lat, selectedStation.lng], 14, {
        duration: 0.8,
      });
    }
  }, [selectedStation]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: '400px' }} />
  );
}
