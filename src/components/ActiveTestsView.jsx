import React, { useEffect, useState, useMemo } from "react";
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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { useAdmin } from "../context/AdminContext";
import PageHeader from "./PageHeader";

const ActiveTestsView = () => {
  const [data, setData] = useState([]);
  const { impersonatedUserId } = useAdmin();

  useEffect(() => {
    const fetchActiveData = async () => {
      try {
        let url = "/active-measurements";
        if (impersonatedUserId) {
          url += `?user_id=${impersonatedUserId}`;
        }
        const resp = await api.get(url);
        const formattedData = resp.data
          .map((item) => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            // Ensure numeric values for charting
            download_mbps: parseFloat(item.download_mbps) || 0,
            upload_mbps: parseFloat(item.upload_mbps) || 0,
            ping_ms: parseInt(item.ping_ms, 10) || 0,
            dns_ms: parseInt(item.dns_ms, 10) || 0,
            web_ms: parseInt(item.web_ms, 10) || 0,
          }))
          .reverse(); // Show oldest first
        setData(formattedData);
      } catch (err) {
        console.error("Error fetching active measurements:", err);
      }
    };
    fetchActiveData();
  }, [impersonatedUserId]);

  const pingStats = useMemo(() => {
    const pings = data.map((d) => d.ping_ms).filter((p) => p > 0);
    if (pings.length === 0) return null;
    const sum = pings.reduce((a, b) => a + b, 0);
    const mean = sum / pings.length;
    const stdDev = Math.sqrt(
      pings.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
        pings.length
    );
    return {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      max: Math.max(...pings),
      min: Math.min(...pings),
    };
  }, [data]);

  const renderChart = (title, dataKey, color, unit) => (
    <div className="bg-surface p-4 rounded-lg shadow-md border border-default">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: unit, angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={title}
            stroke={color}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="bg-app min-h-full">
      <PageHeader title="Active Test Results" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ping Chart */}
          <div className="bg-surface p-4 rounded-lg shadow-md lg:col-span-2 border border-default">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Ping RTT Over Time
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={data}>
                <CartesianGrid />
                <XAxis dataKey="time" name="Time" />
                <YAxis type="number" dataKey="ping_ms" name="Ping" unit="ms" />
                <ZAxis type="number" range={[10, 100]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter
                  name="Ping (ms)"
                  data={data}
                  fill="#ffc658"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
            {pingStats && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-secondary">
                <span>
                  <strong>Mean:</strong> {pingStats.mean} ms
                </span>
                <span>
                  <strong>Std Dev:</strong> {pingStats.stdDev}
                </span>
                <span>
                  <strong>Min:</strong> {pingStats.min} ms
                </span>
                <span>
                  <strong>Max:</strong> {pingStats.max} ms
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChart(
                "Download Throughput",
                "download_mbps",
                "#8884d8",
                "Mbps"
              )}
              {renderChart(
                "Upload Throughput",
                "upload_mbps",
                "#82ca9d",
                "Mbps"
              )}
              {renderChart("Ping RTT", "ping_ms", "#ffc658", "ms")}
              {renderChart("DNS Lookup Time", "dns_ms", "#ff7300", "ms")}
              {renderChart("Web Page Load Time", "web_ms", "#0088FE", "ms")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveTestsView;
