import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../common/LogoutButton";
import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  XMarkIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const InventoryRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All | Pending | Approved | Rejected

  const fetchProductionRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/production-requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch production requests:", err);
      setError("Failed to fetch production requests. Ensure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action, approvedBy = "Inventory Manager") => {
    try {
      const payload = {
        status: action,
        approvedBy,
      };
      if (action === "Approved" || action === "Rejected") {
        payload.approvedAt = new Date().toISOString();
      }

      await axios.put(`http://localhost:5000/api/production-requests/${requestId}/status`, payload);
      await fetchProductionRequests();
      alert(`Request ${action.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(`Failed to ${action.toLowerCase()} request:`, err);
      alert(`Failed to ${action.toLowerCase()} request. Please try again.`);
    }
  };

  useEffect(() => {
    fetchProductionRequests();
    const interval = setInterval(fetchProductionRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusCounts = {
    All: requests.length,
    Pending: requests.filter(r => (r.status || '').toLowerCase() === 'pending').length,
    Approved: requests.filter(r => (r.status || '').toLowerCase() === 'approved').length,
    Rejected: requests.filter(r => (r.status || '').toLowerCase() === 'rejected').length,
  };

  const filteredRequests = requests
    .filter(r => filterStatus === 'All' ? true : (r.status || '').toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar (Inventory section) */}
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
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link
            to="/inventory/deliveries"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Requests</h1>
              <p className="text-gray-600 mt-1">Approve or reject production requests</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                <span className="font-semibold">Pending:</span> {statusCounts.Pending}
              </div>
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
                <span className="font-semibold">Approved:</span> {statusCounts.Approved}
              </div>
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200">
                <span className="font-semibold">Rejected:</span> {statusCounts.Rejected}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
            <div className="inline-flex rounded-xl overflow-hidden border border-gray-200">
              {['All','Pending','Approved','Rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    filterStatus === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${tab !== 'Rejected' ? 'border-r border-gray-200' : ''}`}
                >
                  {tab} <span className="ml-1 text-xs opacity-80">({statusCounts[tab]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-36 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredRequests.length === 0 && (
            <div className="p-8 bg-white rounded-2xl border border-dashed text-center text-gray-600">
              <DocumentChartBarIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              No requests found for the selected filters.
            </div>
          )}

          {/* Cards */}
          {!loading && filteredRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 text-lg">{req.team}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Item:</span> {req.inventoryItemId?.name || "Unknown Item"}
                      </div>
                      <div className="text-sm text-gray-600 flex gap-4">
                        <span><span className="font-medium">Qty:</span> {req.requestedQty}</span>
                        <span><span className="font-medium">Priority:</span> {req.priority}</span>
                      </div>
                      {req.notes && (
                        <div className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {req.notes}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <div>
                          <span className="font-medium">Request Time:</span>{' '}
                          {(req.createdAt || req.createdDate)
                            ? new Date(req.createdAt || req.createdDate).toLocaleString()
                            : '-'}
                        </div>
                        <div>
                          <span className="font-medium">Approved/Rejected Time:</span>{' '}
                          {(req.approvedAt || req.approvedDate)
                            ? new Date(req.approvedAt || req.approvedDate).toLocaleString()
                            : (req.status === 'Approved' || req.status === 'Rejected' ? '—' : '-')}
                        </div>
                        <div>
                          <span className="font-medium">Approved By:</span>{' '}
                          {req.approvedBy || (req.status === 'Approved' ? '—' : '-')}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : req.status === "Approved"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => handleRequestAction(req._id, "Approved")}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                      >
                        <CheckIcon className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(req._id, "Rejected")}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
  );
};

export default InventoryRequests;
