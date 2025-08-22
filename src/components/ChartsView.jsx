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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useAdmin } from "../context/AdminContext";
import PageHeader from "./PageHeader";
import AdminUserSelector from './AdminUserSelector';

const SignalChart = ({ data, title, lines }) => (
  <div className="bg-surface p-4 rounded-lg shadow-md border border-default">
    <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" minTickGap={30} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ChartsView = () => {
  const [data, setData] = useState([]);
  const { impersonatedUserId } = useAdmin();
  const [selectedUserId, setSelectedUserId] = useState(null);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        let url = "/measurements";
        if (impersonatedUserId) {
          url += `?user_id=${impersonatedUserId}`;
        }
        const resp = await api.get(url);
        const arr = resp.data.map((r) => ({
          time: new Date(r.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
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
    };
    fetchAll();
  }, [impersonatedUserId]);

  const technologyDistribution = useMemo(() => {
    const counts = {};
    data.forEach(item => {
        const tech = item.networkType || 'Unknown';
        counts[tech] = (counts[tech] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
}, [data]);

  const lteLines = [
    { dataKey: "rsrp", stroke: "#8884d8", name: "RSRP (dBm)" },
    { dataKey: "rsrq", stroke: "#82ca9d", name: "RSRQ (dB)" },
  ];

  const wcdmaLines = [
    { dataKey: "rscp", stroke: "#ffc658", name: "RSCP (dBm)" },
    { dataKey: "ecno", stroke: "#ff7300", name: "Ec/No (dB)" },
  ];

  const gsmLines = [
    { dataKey: "rxlev", stroke: "#0088FE", name: "RxLev (dBm)" },
  ];

  return (
<div className="flex flex-col h-full w-full">
            <PageHeader title="Passive Charts" />
            <AdminUserSelector selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />
            <div className="flex-grow p-6 bg-app space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-surface p-4 rounded-lg shadow-md border border-default">
                        <h3 className="text-lg font-semibold text-primary mb-4">ARFCN for 4G</h3>
                        <ResponsiveContainer width="100%" height={300}>
                           <PieChart>
                                {/* This is a placeholder; you'd create a similar memoized calculation for ARFCN distribution */}
                                <Pie data={technologyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                     {technologyDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- Line Charts Section --- */}
                <div className="grid grid-cols-1 gap-6">
                    <SignalChart data={data} title="4G (LTE) Metrics" lines={lteLines} />
                    <SignalChart data={data} title="3G (WCDMA) Metrics" lines={wcdmaLines} />
                    <SignalChart data={data} title="2G (GSM) Metrics" lines={gsmLines} />
                </div>
            </div>
        </div>
  );
};

export default ChartsView;
