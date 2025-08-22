import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../api/axiosConfig';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAdmin } from '../context/AdminContext'
import PageHeader from './PageHeader';
import AdminUserSelector from './AdminUserSelector';



const parameterOptions = {
  rsrp: { name: 'RSRP (4G)', unit: 'dBm', thresholds: [-100, -80], colors: ['#d7191c', '#fdae61', '#a6d96a'], bgColors: ['#fee2e2', '#fff7ed', '#f0fdf4'] }, // red-100, orange-100, green-50
  rsrq: { name: 'RSRQ (4G)', unit: 'dB', thresholds: [-15, -10], colors: ['#d7191c', '#fdae61', '#a6d96a'], bgColors: ['#fee2e2', '#fff7ed', '#f0fdf4'] },
  rscp: { name: 'RSCP (3G)', unit: 'dBm', thresholds: [-95, -75], colors: ['#d7191c', '#fdae61', '#a6d96a'], bgColors: ['#fee2e2', '#fff7ed', '#f0fdf4'] },
  ecno: { name: 'Ec/No (3G)', unit: 'dB', thresholds: [-12, -6], colors: ['#d7191c', '#fdae61', '#a6d96a'], bgColors: ['#fee2e2', '#fff7ed', '#f0fdf4'] },
  rxlev: { name: 'RxLev (2G)', unit: 'dBm', thresholds: [-90, -70], colors: ['#d7191c', '#fdae61', '#a6d96a'], bgColors: ['#fee2e2', '#fff7ed', '#f0fdf4'] },
  // Categorical data doesn't have thresholds or colors
  cellId: { name: 'Cell ID', unit: '' },
  tac: { name: 'TAC', unit: '' },
  lac: { name: 'LAC', unit: '' },
  plmnId: { name: 'PLMN-Id', unit: '' },
};

const InfoRow = ({ label, value }) => {
  if (value === null || value === undefined) return null;
  return (
      <div>
          <strong className="font-semibold text-gray-700">{label}:</strong>
          <span className="ml-2 text-gray-800">{value}</span>
      </div>
  );
};


const MapView = () => {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParam, setSelectedParam] = useState('rsrp');
  const [thresholds, setThresholds] = useState(parameterOptions.rsrp.thresholds);
  const [colors, setColors] = useState(parameterOptions.rsrp.colors);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { impersonatedUserId } = useAdmin();
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setIsLoading(true);
        let url = '/measurements/latest';
        if (impersonatedUserId) {
          url += `?user_id=${impersonatedUserId}`;
      }
        const resp = await api.get(url);
        setPoints(resp.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching latest:', err);
        setIsLoading(false);
      }
    };
    fetchLatest();
  }, [impersonatedUserId]);

  const handleParamChange = (e) => {
    const param = e.target.value;
    setSelectedParam(param);
    if (parameterOptions[param].thresholds) {
      setThresholds(parameterOptions[param].thresholds);
      setColors(parameterOptions[param].colors);
    }
  };

  const handleThresholdChange = (index, value) => {
    const newThresholds = [...thresholds];
    newThresholds[index] = Number(value);
    setThresholds(newThresholds);
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const addThreshold = () => {
    setThresholds([...thresholds, 0]);
    setColors([...colors, '#cccccc']);
  };

  const removeThreshold = (index) => {
    setThresholds(thresholds.filter((_, i) => i !== index));
    setColors(colors.filter((_, i) => i !== index));
  };

  const getColor = (value) => {
    if (value === null || value === undefined || !parameterOptions[selectedParam].thresholds) {
        return '#808080';
    }
    // Use the 'thresholds' from state, not from parameterOptions
    const sortedThresholds = [...thresholds].sort((a, b) => a - b);
    
    for (let i = 0; i < sortedThresholds.length; i++) {
        if (value < sortedThresholds[i]) {
            // Use the 'colors' from state
            return colors[i];
        }
    }
    return colors[colors.length - 1];
};

const getBackgroundColor = (value) => {
  const paramConfig = parameterOptions[selectedParam];
  if (value === null || value === undefined || !paramConfig.bgColors) {
      return '#f3f4f6';
  }
  // Use the 'thresholds' from state
  const sortedThresholds = [...thresholds].sort((a, b) => a - b);

  for (let i = 0; i < sortedThresholds.length; i++) {
      if (value < sortedThresholds[i]) {
          return paramConfig.bgColors[i];
      }
  }
  return paramConfig.bgColors[paramConfig.bgColors.length - 1];
};

  const center = points.length > 0 && points[0].latitude && points[0].longitude
    ? [points[0].latitude, points[0].longitude]
    : [35.6892, 51.3890]; // Default to Tehran

  return (
    // ★ FIX: Ensure the container takes up the full height of the main layout area ★
    <div className="flex flex-col h-full w-full">
      <PageHeader title="Map View" />
      <AdminUserSelector selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />
      <div className="relative flex-grow">
      {isLoading ? (
                    <div className="flex items-center justify-center h-full text-secondary">Loading Map...</div>
                ) : points.length > 0 ? (
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => {
          if (p.latitude === null || p.longitude === null) return null;
          const pointColor = getColor(p[selectedParam]);
          const signalBgColor = getBackgroundColor(p[selectedParam]);
          const value = p[selectedParam];
          return (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={6}
              pathOptions={{ color: getColor(value), fillColor: getColor(value), fillOpacity: 0.7 }}
            >
              <Popup>
                                    <div className="w-64 space-y-2 text-sm">

                                        <div className="p-2 bg-gray-100 rounded-md">
                                            <h3 className="font-bold text-base mb-1 text-gray-800">Point Info</h3>
                                            <InfoRow label="Time" value={new Date(p.timestamp).toLocaleString()} />
                                            <InfoRow label="Location" value={`${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`} />
                                        </div>

                                        <div className="p-2 bg-blue-50 rounded-md">
                                            <h3 className="font-bold text-base mb-1 text-blue-800">Serving Cell Info</h3>
                                            <InfoRow label="PLMN Id" value={p.plmnId} />
                                            <InfoRow label="TAC/LAC" value={p.tac || p.lac} />
                                            <InfoRow label="Cell Id" value={p.cellId} />
                                            <InfoRow label="Technology" value={p.networkType} />
                                            <InfoRow label="Band" value={p.band} />
                                            <InfoRow label="ARFCN" value={p.arfcn} />
                                        </div>
                                        
                                        <div 
                                        className="p-2 bg-green-50 rounded-md"
                                        style={{ backgroundColor: signalBgColor }}
                                        >
                                            <h3 className="font-bold text-base mb-1 text-gray-800">Signal Quality</h3>
                                            <InfoRow label="RSRP" value={p.rsrp ? `${p.rsrp} dBm` : null} />
                                            <InfoRow label="RSRQ" value={p.rsrq ? `${p.rsrq} dB` : null} />
                                            <InfoRow label="RSCP" value={p.rscp ? `${p.rscp} dBm` : null} />
                                            <InfoRow label="Ec/No" value={p.ecno ? `${p.ecno} dB` : null} />
                                            <InfoRow label="RxLev" value={p.rxlev ? `${p.rxlev} dBm` : null} />
                                        </div>
                                    </div>
                                </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
) : (
  <div className="flex items-center justify-center h-full">No data points to display on the map.</div>
                )}
      <div className="absolute top-4 right-4 z-[1000] bg-surface p-4 rounded-lg shadow-lg w-80 border border-default">
        <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="w-full flex justify-between items-center font-bold text-lg mb-2 text-primary">
          <span>Map Controls</span>
          {isPanelOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
        {isPanelOpen && (
          <>
            <div className="mt-4">
              <label className="block font-semibold mb-1 text-primary">Parameter</label>
              <select value={selectedParam} onChange={handleParamChange} className="w-full p-2 border rounded bg-app border-default text-primary">
                {Object.entries(parameterOptions).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            {parameterOptions[selectedParam].thresholds && (
              <div className="mt-4">
                <label className="block font-semibold mb-1 text-primary">Thresholds & Colors</label>
                {thresholds.map((thresh, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-2 text-primary">
                    <span>Value &lt;</span>
                    <input type="number" value={thresh} onChange={(e) => handleThresholdChange(i, e.target.value)} className="w-20 p-1 border rounded bg-app border-default text-primary" />
                    <input type="color" value={colors[i]} onChange={(e) => handleColorChange(i, e.target.value)} className="w-8 h-8" />
                    <button onClick={() => removeThreshold(i)} className="text-red-500">&times;</button>
                  </div>
                ))}
                <div className="flex items-center space-x-2 text-primary">
                    <span>Else</span>
                    <input type="color" value={colors[colors.length-1]} onChange={(e) => handleColorChange(colors.length-1, e.target.value)} className="w-8 h-8" />
                </div>
                <button onClick={addThreshold} className="mt-2 text-accent text-sm">+ Add Threshold</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default MapView;
