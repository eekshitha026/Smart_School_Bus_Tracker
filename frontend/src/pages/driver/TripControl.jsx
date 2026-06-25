import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';

const TripControl = () => {
  const { profile } = useAuth();
  const [tripActive, setTripActive] = useState(profile?.assignedBus?.currentTrip?.isActive || false);
  const [tripType, setTripType] = useState('morning');
  const busId = profile?.assignedBus?._id;

  const { location, error, watching } = useGeolocation(busId, tripActive);

  const startTrip = async () => {
    try {
      const { data } = await api.post('/attendance/trip/start', { tripType });
      setTripActive(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start trip');
    }
  };

  const endTrip = async () => {
    try {
      const { data } = await api.post('/attendance/trip/end');
      setTripActive(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end trip');
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Trip Control</h1>

      <div className="card space-y-4">
        <div>
          <label className="label">Trip Type</label>
          <select className="input-field" value={tripType} onChange={(e) => setTripType(e.target.value)} disabled={tripActive}>
            <option value="morning">Morning (Pickup → School)</option>
            <option value="afternoon">Afternoon (School → Home)</option>
          </select>
        </div>

        <div className={`p-4 rounded-lg ${tripActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
          <p className="font-semibold">{tripActive ? '🟢 Trip Active' : '⏸️ No Active Trip'}</p>
          {tripActive && watching && <p className="text-sm text-green-600 mt-1">GPS tracking enabled</p>}
        </div>

        {location && (
          <div className="text-sm text-gray-600">
            <p>Lat: {location.latitude?.toFixed(6)}</p>
            <p>Lng: {location.longitude?.toFixed(6)}</p>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          {!tripActive ? (
            <button onClick={startTrip} className="btn-primary flex-1 py-3">Start Trip</button>
          ) : (
            <button onClick={endTrip} className="bg-red-600 text-white px-4 py-3 rounded-lg flex-1 font-medium hover:bg-red-700">
              End Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripControl;
