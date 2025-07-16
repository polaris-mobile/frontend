import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import api from "../api/axiosConfig";

export default function MapView() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const resp = await api.get("/measurements/latest?limit=200");
        setPoints(resp.data);
      } catch (err) {
        console.error("Error fetching latest:", err);
      }
    }
    fetchLatest();
  }, []);

  const center =
    points.length > 0 ? [points[0].latitude, points[0].longitude] : [0, 0];

  return (
    <div className="min-h-screen">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-2xl text-gray-800">Map View</h2>
      </div>
      <MapContainer
        center={center}
        zoom={points.length > 0 ? 13 : 2}
        style={{ height: "calc(100vh - 4rem)", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => {
          if (p.latitude === null || p.longitude === null) return null;
          let color = "blue";
          if (p.rsrp !== null) {
            if (p.rsrp >= -80) color = "green";
            else if (p.rsrp >= -100) color = "orange";
            else color = "red";
          }
          return (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={6}
              color={color}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="text-sm text-gray-800">
                  <strong>Time:</strong>{" "}
                  {new Date(p.timestamp).toLocaleString()}
                  <br />
                  <strong>Tech:</strong> {p.networkType}
                  <br />
                  <strong>PLMN:</strong> {p.plmnId}
                  <br />
                  <strong>Cell ID:</strong> {p.cellId}
                  <br />
                  <strong>RSRP:</strong> {p.rsrp ?? "N/A"}
                  <br />
                  <strong>RSRQ:</strong> {p.rsrq ?? "N/A"}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
