import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axiosConfig";
import { ArrowUpDown } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import PageHeader from "./PageHeader";

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const SortableHeader = ({ children, name, sortConfig, requestSort }) => {
  const isSorted = sortConfig && sortConfig.key === name;
  return (
    <th className="px-4 py-2 bg-gray-200 text-left text-sm font-medium text-gray-700">
      <button
        onClick={() => requestSort(name)}
        className="flex items-center space-x-1"
      >
        <span>{children}</span>
        <ArrowUpDown
          size={14}
          className={isSorted ? "text-blue-600" : "text-gray-400"}
        />
      </button>
    </th>
  );
};

const PassiveTable = () => {
  const [measurements, setMeasurements] = useState([]);
  const { items, requestSort, sortConfig } = useSortableData(measurements);
  const { impersonatedUserId } = useAdmin();

  useEffect(() => {
    let url = "/measurements";
    if (impersonatedUserId) {
      url += `?user_id=${impersonatedUserId}`;
    }
    api
      .get(url)
      .then((resp) => setMeasurements(resp.data))
      .catch((err) =>
        console.error("Error fetching passive measurements:", err)
      );
  }, [impersonatedUserId]);

  const headers = [
    { key: "timestamp", name: "Timestamp" },
    { key: "networkType", name: "Tech" },
    { key: "plmnId", name: "PLMN" },
    { key: "cellId", name: "Cell ID" },
    { key: "lac", name: "LAC" },
    { key: "tac", name: "TAC" },
    { key: "rsrp", name: "RSRP" },
    { key: "rsrq", name: "RSRQ" },
    { key: "rscp", name: "RSCP" },
    { key: "arfcn", name: "ARFCN" },
    { key: "band", name: "Band" },
    { key: "ecno", name: "Ec/No" },
    { key: "rxlev", name: "RxLev" },
  ];

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
      <PageHeader title="Table View" />
      <table className="min-w-full">
        <thead>
          <tr>
            {headers.map((h) => (
              <SortableHeader
                key={h.key}
                name={h.key}
                sortConfig={sortConfig}
                requestSort={requestSort}
              >
                {h.name}
              </SortableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.id}
              className="border-b hover:bg-gray-50 text-sm text-gray-800"
            >
              <td className="px-4 py-2">
                {new Date(r.timestamp).toLocaleString()}
              </td>
              {headers.slice(1).map((h) => (
                <td key={h.key} className="px-4 py-2">
                  {r[h.key] ?? "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ActiveTable = () => {
  const [measurements, setMeasurements] = useState([]);
  const { items, requestSort, sortConfig } = useSortableData(measurements);
  const { impersonatedUserId } = useAdmin();

  useEffect(() => {
    let url = "/active-measurements";
    if (impersonatedUserId) {
      url += `?user_id=${impersonatedUserId}`;
    }
    api
      .get(url)
      .then((resp) => setMeasurements(resp.data))
      .catch((err) =>
        console.error("Error fetching active measurements:", err)
      );
  }, [impersonatedUserId]);

  const headers = [
    { key: "timestamp", name: "Timestamp" },
    { key: "download_mbps", name: "Download (Mbps)" },
    { key: "upload_mbps", name: "Upload (Mbps)" },
    { key: "ping_ms", name: "Ping (ms)" },
    { key: "dns_ms", name: "DNS (ms)" },
    { key: "web_ms", name: "Web (ms)" },
    { key: "sms_result", name: "SMS Result" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {headers.map((h) => (
              <SortableHeader
                key={h.key}
                name={h.key}
                sortConfig={sortConfig}
                requestSort={requestSort}
              >
                {h.name}
              </SortableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.id}
              className="border-b hover:bg-gray-50 text-sm text-gray-800"
            >
              <td className="px-4 py-2">
                {new Date(r.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2">{r.download_mbps?.toFixed(2)}</td>
              <td className="px-4 py-2">{r.upload_mbps?.toFixed(2)}</td>
              <td className="px-4 py-2">{r.ping_ms}</td>
              <td className="px-4 py-2">{r.dns_ms}</td>
              <td className="px-4 py-2">{r.web_ms}</td>
              <td className="px-4 py-2">{r.sms_result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableView = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader title="Table View" />
      <div className="flex-grow p-6 bg-gray-50 space-y-8 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Passive Measurements
          </h2>
          <PassiveTable />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Active Test Measurements
          </h2>
          <ActiveTable />
        </div>
      </div>
    </div>
  );
};

export default TableView;
