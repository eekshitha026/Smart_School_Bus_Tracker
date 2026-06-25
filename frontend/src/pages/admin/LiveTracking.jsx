import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socket';
import api from '../../services/api';
import BusMap from '../../components/BusMap';

const LiveTracking = () => {
  const [locations, setLocations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const load = () => {
      Promise.all([
        api.get('/tracking/locations'),
        api.get('/tracking/active-trips'),
      ]).then(([loc, trip]) => {
        setLocations(loc.data.data);
        setTrips(trip.data.data);
        setRoutes(trip.data.data.map((t) => t.bus?.routeId).filter(Boolean));
      });
    };

    load();
    const socket = getSocket();
    if (socket) {
      const handler = (data) => {
        if (!data) return;
        setLocations((prev) => {
          const filtered = prev.filter((l) => (l.busId?._id || l.busId) !== (data.busId?._id || data.busId));
          return [data, ...filtered];
        });
      };
      socket.on('location:receive', handler);
      return () => socket.off('location:receive', handler);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Bus Tracking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card p-0 overflow-hidden h-[500px]">
          <BusMap locations={locations} routes={routes} showRoute />
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold">Active Trips ({trips.length})</h2>
          {trips.map(({ bus, location }) => (
            <div key={bus._id} className="card p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Bus {bus.busNumber}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                  {bus.currentTrip?.tripType}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{bus.routeId?.routeName}</p>
              {location && (
                <p className="text-xs text-gray-400 mt-2">
                  Last update: {new Date(location.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          ))}
          {trips.length === 0 && <p className="text-sm text-gray-500">No active trips</p>}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
