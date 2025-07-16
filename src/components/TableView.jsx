import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function TableView() {
  const [measurements, setMeasurements] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    async function fetchAll() {
      try {
        const resp = await api.get("/measurements");
        setMeasurements(resp.data);
      } catch (err) {
        console.error("Error fetching all measurements:", err);
      }
    }
    fetchAll();
  }, []);

  const totalPages = Math.ceil(measurements.length / perPage);
  const paginated = measurements.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl mb-4 text-gray-800">All Measurements</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr>
              {[
                "Timestamp",
                "Lat",
                "Lon",
                "Tech",
                "PLMN",
                "LAC",
                "TAC",
                "Cell ID",
                "RSRP",
                "RSRQ",
                "RSCP",
                "Ec/No",
                "RxLev",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 bg-gray-200 text-left text-sm font-medium text-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-800">
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.latitude}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.longitude}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.networkType}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.plmnId}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.lac}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.tac}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.cellId}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.rsrp}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.rsrq}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.rscp}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.ecno}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.rxlev}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-gray-800">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
