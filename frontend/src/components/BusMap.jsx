import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useState, useCallback, useMemo } from 'react';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '400px' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };

const BusMap = ({ locations = [], routes = [], center, zoom = 13, showRoute = false }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (locations.length > 0) {
      return { lat: locations[0].latitude, lng: locations[0].longitude };
    }
    return defaultCenter;
  }, [center, locations]);

  const onMapLoad = useCallback(() => {}, []);

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-600 font-medium">Google Maps API key required</p>
          <p className="text-sm text-gray-500 mt-2">Set VITE_GOOGLE_MAPS_API_KEY in frontend/.env</p>
          {locations.length > 0 && (
            <div className="mt-4 text-left text-sm space-y-2">
              {locations.map((loc, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                  Bus {loc.busId?.busNumber || loc.busId}: {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadError) return <div className="text-red-500 p-4">Error loading maps</div>;
  if (!isLoaded) return <div className="flex items-center justify-center h-96">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={zoom}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: true }}
    >
      {locations.map((loc) => {
        if (!loc.latitude || !loc.longitude) return null;
        const busId = loc.busId?._id || loc.busId;
        return (
          <Marker
            key={busId || `${loc.latitude}-${loc.longitude}`}
            position={{ lat: loc.latitude, lng: loc.longitude }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/bus.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            onClick={() => setSelectedBus(loc)}
          />
        );
      })}

      {showRoute &&
        routes.map((route, idx) => {
          if (!route?.stops?.length) return null;
          const path = route.stops.map((s) => ({ lat: s.latitude, lng: s.longitude }));
          return (
            <Polyline
              key={idx}
              path={path}
              options={{ strokeColor: '#2563eb', strokeWeight: 4, strokeOpacity: 0.8 }}
            />
          );
        })}

      {selectedBus && (
        <InfoWindow
          position={{ lat: selectedBus.latitude, lng: selectedBus.longitude }}
          onCloseClick={() => setSelectedBus(null)}
        >
          <div className="p-1">
            <p className="font-semibold">Bus {selectedBus.busId?.busNumber || 'N/A'}</p>
            <p className="text-sm text-gray-600">
              Speed: {selectedBus.speed || 0} km/h
            </p>
            <p className="text-xs text-gray-500">
              Updated: {new Date(selectedBus.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default BusMap;
