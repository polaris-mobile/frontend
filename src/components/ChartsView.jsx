import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartsView() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const resp = await api.get("/measurements");
        const arr = resp.data.map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString(),
          rsrp: r.rsrp,
          rsrq: r.rsrq,
          rscp: r.rscp,
          ecno: r.ecno,
          rxlev: r.rxlev,
        }));
        setData(arr.reverse());
      } catch (err) {
        console.error("Error fetching for charts:", err);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl mb-4 text-gray-800">
        Signal Metrics Over Time
      </h2>
      <div className="w-full h-96 bg-white shadow rounded p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rsrp"
              stroke="#8884d8"
              dot={false}
              name="RSRP (dBm)"
            />
            <Line
              type="monotone"
              dataKey="rsrq"
              stroke="#82ca9d"
              dot={false}
              name="RSRQ (dB)"
            />
            {/* Add more lines if desired */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
