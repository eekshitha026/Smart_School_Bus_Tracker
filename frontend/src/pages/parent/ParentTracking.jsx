import { useEffect, useState } from 'react';
import { getSocket, joinBusRoom } from '../../services/socket';
import api from '../../services/api';
import BusMap from '../../components/BusMap';

const ParentTracking = () => {
  const [locations, setLocations] = useState([]);
  const [children, setChildren] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    api.get('/tracking/parent/bus').then(({ data }) => {
      setLocations(data.data);
      setChildren(data.students);
      setRoutes(data.data.map((l) => l.busId?.routeId).filter(Boolean));
      data.data.forEach((l) => {
        const busId = l.busId?._id || l.busId;
        if (busId) joinBusRoom(busId);
      });
    });

    const socket = getSocket();
    if (socket) {
      const handler = (data) => {
        if (!data) return;
        setLocations((prev) => {
          const id = data.busId?._id || data.busId;
          return [data, ...prev.filter((l) => (l.busId?._id || l.busId) !== id)];
        });
      };
      socket.on('location:receive', handler);
      return () => socket.off('location:receive', handler);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Track School Bus</h1>

      <div className="card p-0 overflow-hidden h-[450px]">
        <BusMap locations={locations} routes={routes} showRoute />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <div key={child._id} className="card">
            <h3 className="font-semibold">{child.name}</h3>
            <p className="text-sm text-gray-500">Bus {child.assignedBus?.busNumber || 'Not assigned'}</p>
            <p className="text-sm text-gray-500">Pickup: {child.pickupStop || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentTracking;
