import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import { ClipboardDocumentListIcon, CubeIcon, ChartBarIcon, ArrowTrendingUpIcon, DocumentChartBarIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

export default function InventoryDeliveryRecords() {
  const [rows, setRows] = useState([]); // transport requests
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveredDate, setDeliveredDate] = useState(""); // yyyy-mm-dd
  const todayYMD = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const res = await axios.get("http://localhost:5000/api/transport/drivers");
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.drivers)
            ? payload.drivers
            : (Array.isArray(payload?.data)
                ? payload.data
                : []));
      setDrivers(list);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.employees)
            ? payload.employees
            : (Array.isArray(payload?.data)
                ? payload.data
                : []));
      setEmployees(list);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [assignedRes, pickedUpRes, deliveredRes] = await Promise.all([
        axios.get("http://localhost:5000/api/transport-requests", { params: { status: "Assigned" } }),
        axios.get("http://localhost:5000/api/transport-requests", { params: { status: "PickedUp" } }),
        axios.get("http://localhost:5000/api/transport-requests", { params: { status: "Delivered" } }),
      ]);
      const a = assignedRes?.data?.requests || [];
      const p = pickedUpRes?.data?.requests || [];
      const d = deliveredRes?.data?.requests || [];
      setRows([...a, ...p, ...d].sort((x,y)=> new Date(x.createdAt) - new Date(y.createdAt)));
    } catch (err) {
      console.error("Failed to fetch transport requests", err);
      setError("Failed to fetch records. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Load employees and drivers first so we can map IDs to names on initial render
      await fetchEmployees();
      await fetchDrivers();
      await fetchRequests();
    })();
    // Listen for events from Transport page to refresh
    const handler = () => { fetchRequests(); };
    window.addEventListener('transport:assigned-updated', handler);
    window.addEventListener('transport:status-updated', handler);
    // Polling disabled; rely on manual Refresh button and events
    return () => {
      window.removeEventListener('transport:assigned-updated', handler);
      window.removeEventListener('transport:status-updated', handler);
    };
  }, []);

  const driverName = (id) => {
    if (!id) return "-";
    // 1) Try Employees table: match by Mongo _id or employeeId and use fullName
    const emp = employees.find(e =>
      (e?._id && (e._id === id || String(e._id) === String(id))) ||
      (e?.employeeId && (e.employeeId === id || String(e.employeeId) === String(id)))
    );
    if (emp) {
      const full = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
      return full || emp.employeeId || id;
    }
    // 2) Fallback to Drivers table: match by _id or employeeId and compose name
    const d = drivers.find(x =>
      (x?._id && (x._id === id || String(x._id) === String(id))) ||
      (x?.employeeId && (x.employeeId === id || String(x.employeeId) === String(id)))
    );
    if (d) {
      const first = d.personalInfo?.firstName || "";
      const last = d.personalInfo?.lastName || "";
      const name = `${first} ${last}`.trim();
      return name || d.employeeId || id;
    }
    // 3) Last resort: show the raw id
    return id;
  };

  const markDelivered = async (row) => {
    try {
      await axios.post(`http://localhost:5000/api/transport-requests/${row._id}/status`, { status: 'Delivered' });
      await fetchRequests();
    } catch (err) {
      console.error('Mark delivered failed', err);
      setError('Failed to mark as delivered.');
    }
  };

  // Derived: filtered rows based on search
  const filteredRows = rows.filter((r) => {
    // Driver name prefix match
    const needle = searchTerm.trim().toLowerCase();
    const drvName = String(driverName(r.assignedDriverId) || "").toLowerCase();
    if (needle && !drvName.startsWith(needle)) return false;

    // Delivered date filter
    if (deliveredDate) {
      // Only include rows that are delivered and match the selected date
      const ts = r.updatedAt || r.deliveredAt;
      if (!ts || r.status !== 'Delivered') return false;
      try {
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const localYMD = `${y}-${m}-${dd}`;
        if (localYMD !== deliveredDate) return false;
      } catch {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inventory Hub</h2>
              <p className="text-sm text-gray-500">Material Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            to="/inventory"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Overview</span>
          </Link>
          <Link
            to="/inventory/stock"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </Link>
          <Link
            to="/inventory/requests"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link
            to="/inventory/deliveries"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="font-medium">Delivery Records</span>
          </Link>
          
          <Link
            to="/inventory/analytics"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link
            to="/inventory/materials"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link
            to="/inventory/reports"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Records</h1>
              <p className="text-gray-600">End-to-end tracking from collectors to inventory</p>
            </div>
            <button onClick={fetchRequests} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Refresh</button>
          </div>
        </header>

        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}

          {/* Search Bar */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                if (!/^[A-Za-z\s]*$/.test(v)) return; // letters and spaces only
                setSearchTerm(v);
              }}
              onKeyDown={(e) => {
                const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                const isLetter = /^[A-Za-z]$/.test(e.key);
                const isSpace = e.key === ' ';
                if (!isLetter && !isSpace && !allowedControl.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                const cleaned = text.replace(/[^A-Za-z\s]/g, '');
                const next = (searchTerm || '') + cleaned;
                if (/^[A-Za-z\s]*$/.test(next)) {
                  setSearchTerm(next);
                }
              }}
              pattern="[A-Za-z\s]*"
              title="Only letters and spaces are allowed"
              placeholder="Search by Driver Name"
              className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={deliveredDate}
                onChange={(e) => {
                  const v = e.target.value;
                  // prevent selecting future dates
                  if (v && v > todayYMD) return;
                  setDeliveredDate(v);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter by Delivered Date"
                max={todayYMD}
              />
              {deliveredDate && (
                <button
                  type="button"
                  onClick={() => setDeliveredDate("")}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="p-6 text-gray-600">Loading records...</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-700">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Stock ID</th>
                    <th className="py-3 px-4 font-semibold">Driver Name</th>
                    <th className="py-3 px-4 font-semibold">Scheduled Pickup Time</th>
                    <th className="py-3 px-4 font-semibold">Weight (kg)</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Delivered Time</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r._id} className="border-t text-sm">
                      <td className="py-3 px-4">{r.collectorName || '-'}</td>
                      <td className="py-3 px-4 font-mono">{r.requestId || (r._id?.slice(-6) || '-')}</td>
                      <td className="py-3 px-4">{driverName(r.assignedDriverId)}</td>
                      <td className="py-3 px-4">{r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : '-'}</td>
                      <td className="py-3 px-4 font-semibold">{r.quantity}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {r.status === 'Delivered' ? 'Received' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{r.status === 'Delivered' ? (r.updatedAt ? new Date(r.updatedAt).toLocaleString() : (r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : '-')) : '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={()=>{ if(r.status!== 'Delivered'){ markDelivered(r); } }}
                          disabled={r.status === 'Delivered' || !(r.scheduledAt && new Date(r.scheduledAt) <= new Date())}
                          title={!(r.scheduledAt && new Date(r.scheduledAt) <= new Date()) ? 'Enabled at the scheduled pickup time' : ''}
                          className={`px-3 py-1 rounded ${r.status === 'Delivered' || !(r.scheduledAt && new Date(r.scheduledAt) <= new Date()) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white'}`}
                        >Delivered</button>
                      </td>
                    </tr>
                  ))}
                  {rows.length > 0 && filteredRows.length === 0 && (
                    <tr>
                      <td className="py-6 px-4 text-gray-500" colSpan={8}>No records match your search.</td>
                    </tr>
                  )}
                  {rows.length === 0 && (
                    <tr>
                      <td className="py-6 px-4 text-gray-500" colSpan={8}>No delivery records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
