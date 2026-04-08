import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function MapView() {
  const navigate = useNavigate();
  const { notes, cocoons } = useStore();
  const [userLocation, setUserLocation] = useState<[number, number]>([51.505, -0.09]); // Default London

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.warn('Location access denied or failed:', err)
      );
    }
  }, []);

  const notesWithLocation = notes.filter(n => n.location);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-2 p-4 pt-safe pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-full shadow-md pointer-events-auto hover:scale-105 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 z-0">
        <MapContainer 
          center={userLocation} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {notesWithLocation.map(note => {
            const cocoon = cocoons.find(c => c.id === note.cocoonId);
            if (!cocoon || !note.location) return null;

            return (
              <Marker 
                key={note.id} 
                position={[note.location.lat, note.location.lng]}
                icon={createCustomIcon(cocoon.color)}
              >
                <Popup className="rounded-xl overflow-hidden">
                  <div className="p-1 cursor-pointer" onClick={() => navigate(`/note/${note.id}`)}>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: cocoon.color }}>{cocoon.name}</h3>
                    <p className="text-xs line-clamp-2">{note.text}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
