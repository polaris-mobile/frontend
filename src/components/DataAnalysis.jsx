import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axiosConfig";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdmin } from "../context/AdminContext";
import PageHeader from "./PageHeader";
import mciLogo from "../assets/logos/mci.png";
import irancellLogo from "../assets/logos/irancell.png";
import rightelLogo from "../assets/logos/rightel.png";

const StatCard = ({ title, value, unit, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col justify-between">
    <div>
      <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
        {title}
      </h3>
      <div className="text-3xl font-bold text-gray-800 mt-2 flex items-center justify-center">
        {children || value}
        {unit && (
          <span className="text-lg font-medium text-gray-600 ml-2">{unit}</span>
        )}
      </div>
    </div>
  </div>
);

const operatorInfo = {
  "IR-MCI": { logo: mciLogo },
  Irancell: { logo: irancellLogo },
  Rightel: { logo: rightelLogo },
  Taliya: { logo: null }, // Add other logos if you have them
  Unknown: { logo: null },
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const getOperatorName = (plmnId) => {
  if (!plmnId) return "Unknown";
  if (plmnId.startsWith("43211")) return "IR-MCI";
  if (plmnId.startsWith("43235")) return "Irancell";
  if (plmnId.startsWith("43220")) return "Rightel";
  if (plmnId.startsWith("43232")) return "Taliya";
  return `Other (${plmnId})`;
};

const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DataAnalysis = () => {
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { impersonatedUserId } = useAdmin();

  useEffect(() => {
    setIsLoading(true);
    let url = "/measurements";
    if (impersonatedUserId) {
      url += `?user_id=${impersonatedUserId}`;
    }
    api
      .get(url)
      .then((response) => {
        setMeasurements(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch measurements for analysis:", error);
        setMeasurements([])
      })
        .finally(() => {
          setIsLoading(false);
      }
  );
  }, [impersonatedUserId]);

  const analysisResults = useMemo(() => {
    if (measurements.length === 0) return null;

    // --- Basic Stats ---
    const rsrpValues = measurements
      .map((d) => d.rsrp)
      .filter((v) => v !== null);
    const avgRsrp =
      rsrpValues.length > 0
        ? (rsrpValues.reduce((a, b) => a + b, 0) / rsrpValues.length).toFixed(2)
        : "N/A";

    // --- Operator Analysis ---
    const operatorCounts = {};
    measurements.forEach((m) => {
      const operator = getOperatorName(m.plmnId);
      operatorCounts[operator] = (operatorCounts[operator] || 0) + 1;
    });
    const primaryOperator = Object.keys(operatorCounts).reduce(
      (a, b) => (operatorCounts[a] > operatorCounts[b] ? a : b),
      "None"
    );

    // --- Daily Distance Calculation ---
    const pointsByDay = {};
    measurements.forEach((m) => {
      if (m.latitude && m.longitude) {
        const day = new Date(m.timestamp).toLocaleDateString();
        if (!pointsByDay[day]) pointsByDay[day] = [];
        pointsByDay[day].push({ lat: m.latitude, lon: m.longitude });
      }
    });

    let totalDistance = 0;
    const mostRecentDay = Object.keys(pointsByDay).sort(
      (a, b) => new Date(b) - new Date(a)
    )[0];
    if (mostRecentDay && pointsByDay[mostRecentDay].length > 1) {
      for (let i = 0; i < pointsByDay[mostRecentDay].length - 1; i++) {
        totalDistance += haversineDistance(
          pointsByDay[mostRecentDay][i],
          pointsByDay[mostRecentDay][i + 1]
        );
      }
    }

    // --- Network Type Distribution for Pie Chart ---
    const networkCounts = {};
    measurements.forEach((m) => {
      const tech = m.networkType || "Unknown";
      networkCounts[tech] = (networkCounts[tech] || 0) + 1;
    });

    const homePoints = [];
    const workPoints = [];
    measurements.forEach((m) => {
      if (m.latitude && m.longitude) {
        const date = new Date(m.timestamp);
        const hour = new Date(m.timestamp).getHours();
        const day = new Date(m.timestamp).getDay(); // 0=Sun, 6=Sat

        // Home: Weekday nights (10 PM to 6 AM) and all day Thursday/Friday
        if (day === 4 || day === 5 || hour >= 22 || hour < 6) {
          homePoints.push([m.latitude, m.longitude]);
        }

        // Work: Saturday to Wednesday daytime (9 AM to 5 PM)
        if ((day === 6 || (day >= 0 && day <= 3)) && hour >= 9 && hour < 17) {
          workPoints.push([m.latitude, m.longitude]);
        }
      }
    });

    const findCentroid = (points) => {
      if (points.length === 0) return "N/A";
      let latSum = 0,
        lonSum = 0;
      points.forEach((p) => {
        latSum += p[0];
        lonSum += p[1];
      });
      return `${(latSum / points.length).toFixed(4)}, ${(
        lonSum / points.length
      ).toFixed(4)}`;
    };
    const homeLocation = findCentroid(homePoints);
    const workLocation = findCentroid(workPoints);

    const networkTypeDistribution = Object.keys(networkCounts).map((key) => ({
      name: key,
      value: networkCounts[key],
    }));

    const rsrpVsRsrqData = measurements
      .filter((m) => m.rsrp != null && m.rsrq != null)
      .map((m) => ({ x: m.rsrp, y: m.rsrq }));
    const networkTypes = [
      ...new Set(measurements.map((d) => d.networkType)),
    ].join(", ");
    return {
      total: measurements.length,
      avgRsrp,
      primaryOperator,
      dailyDistance: totalDistance.toFixed(2),
      networkTypeDistribution,
      rsrpVsRsrqData,
      networkTypes,
      latestTimestamp: new Date(measurements[0].timestamp).toLocaleString(),
      homeLocation,
      workLocation,
    };
  }, [measurements]);

  if (isLoading) {
    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader title="Advanced Data Analysis" />
            <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500">Analyzing data...</p>
            </div>
        </div>
    );
}

if (!analysisResults) {
  return (
      <div className="flex flex-col h-full w-full bg-gray-50">
          <PageHeader title="Advanced Data Analysis" />
          <div className="flex-grow flex items-center justify-center">
              <p className="text-center text-gray-600">
                  There is not enough data to generate an analysis for the selected user.
              </p>
          </div>
      </div>
  );
}
  return (
    <div className="bg-gray-50 min-h-full">
      <PageHeader title="Advanced Data Analysis" />
      <div className="p-6">
        {analysisResults ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Measurements"
              value={analysisResults.total}
            />
            <StatCard
              title="Average RSRP"
              value={analysisResults.avgRsrp}
              unit="dBm"
            />
            <StatCard title="Primary Operator">
              <div className="flex items-center justify-center">
                {operatorInfo[analysisResults.primaryOperator]?.logo && (
                  <img
                    src={operatorInfo[analysisResults.primaryOperator].logo}
                    alt={analysisResults.primaryOperator}
                    className="h-8 mr-2"
                  />
                )}
                <span>{analysisResults.primaryOperator}</span>
              </div>
            </StatCard>
            <StatCard
              title="Distance on Last Active Day"
              value={analysisResults.dailyDistance}
              unit="km"
            />
            <StatCard
              title="Network Types"
              value={analysisResults.networkTypes}
            />
            <StatCard
              title="Latest Reading"
              value={analysisResults.latestTimestamp}
            />
            <StatCard
              title="Est. Home Location (Lat, Lon)"
              value={analysisResults.homeLocation}
            />
            <StatCard
              title="Est. Work Location (Lat, Lon)"
              value={analysisResults.workLocation}
            />
          </div>
        ) : (
          <p>No data available to analyze.</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart for Network Type Distribution */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Network Technology Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analysisResults.networkTypeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {analysisResults.networkTypeDistribution.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    `${((value / measurements.length) * 100).toFixed(1)}%`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              RSRP vs. RSRQ Correlation
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="RSRP (dBm)"
                  unit="dBm"
                  domain={[-130, -70]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="RSRQ (dB)"
                  unit="dB"
                  domain={[-20, -3]}
                />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter
                  name="Measurements"
                  data={analysisResults.rsrpVsRsrqData}
                  fill="#82ca9d"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
