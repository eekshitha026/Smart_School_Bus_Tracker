import { useState, useEffect } from 'react';
import { getSocket, emitLocationUpdate } from '../services/socket';

const useGeolocation = (busId, enabled = false, intervalMs = 5000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (!enabled || !busId) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setWatching(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ? position.coords.speed * 3.6 : 0,
          heading: position.coords.heading || 0,
          busId,
        };
        setLocation(loc);
        emitLocationUpdate(loc);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, [enabled, busId, intervalMs]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (data) => {
      if (data?.busId === busId || data?.busId?._id === busId) {
        setLocation(data);
      }
    };

    socket.on('location:receive', handler);
    return () => socket.off('location:receive', handler);
  }, [busId]);

  return { location, error, watching };
};

export default useGeolocation;
