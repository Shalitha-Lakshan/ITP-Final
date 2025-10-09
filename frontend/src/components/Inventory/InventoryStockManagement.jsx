import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import { CubeIcon, ClipboardDocumentListIcon, ChartBarIcon, ArrowTrendingUpIcon, DocumentChartBarIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

export default function InventoryStockManagement() {
  const [loading, setLoading] = useState(true);
  const [deliveredTotalKg, setDeliveredTotalKg] = useState(0); // shows available Kg
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestWeightKg, setRequestWeightKg] = useState("");
  const [requests, setRequests] = useState([]); // {id, requestId, weightKg, createdAt}
  const [editingId, setEditingId] = useState(null);
  const [editWeightKg, setEditWeightKg] = useState("");

  // Numeric helpers and constraints for Requested weight inputs
  const MIN_KG = 1;
  const MAX_KG = 100000;
  const handleNumericKeyDown = (e) => {
    // Disallow scientific notation and signs in number input
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
    // Only one decimal point and not as the first character
    if (e.key === '.') {
      const { value } = e.currentTarget;
      if (value.length === 0 || value.includes('.')) {
        e.preventDefault();
        return;
      }
    }
    // Prevent starting with 0 (values must be >= 1)
    if (/^\d$/.test(e.key)) {
      const { value } = e.currentTarget;
      if ((value === '' && e.key === '0') || value === '0') {
        e.preventDefault();
      }
    }
    // Do not allow typing a digit that would push the value over MAX_KG
    if (/^\d$/.test(e.key)) {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd, value } = input;
      const next = value.slice(0, selectionStart ?? value.length) + e.key + value.slice((selectionEnd ?? selectionStart) ?? value.length);
      const nextNum = Number(next);
      if (!Number.isNaN(nextNum) && nextNum > MAX_KG) {
        e.preventDefault();
        return;
      }
      // Enforce maximum three decimal places when typing
      const match = next.match(/^\d*(?:\.(\d*))?$/);
      if (match) {
        const decimals = match[1] || '';
        if (decimals.length > 3) {
          e.preventDefault();
          return;
        }
      }
    }
  };
  const formatClamp3 = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    const clamped = Math.max(MIN_KG, Math.min(MAX_KG, n));
    return clamped.toFixed(3);
  };

  const fetchDeliveredTotal = async () => {
    try {
      setLoading(true);
      // Use backend summary: availableKg already accounts for delivered minus requested
      const res = await axios.get("http://localhost:5000/api/stock-requests/summary");
      const available = Number(res.data?.availableKg ?? 0);
      setDeliveredTotalKg(available);
    } catch (err) {
      console.error("Failed to fetch available stock summary", err);
      setDeliveredTotalKg(0);
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const beginEdit = (req) => {
    setEditingId(req._id || req.id);
    setEditWeightKg(String(req.weightKg));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeightKg("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const newWeight = Number(formatClamp3(editWeightKg));
    if (Number.isNaN(newWeight) || newWeight < MIN_KG || newWeight > MAX_KG) {
      alert(`Please enter a valid requested weight in Kg (between ${MIN_KG} and ${MAX_KG})`);
      return;
    }
    const currentReq = requests.find((r) => (r._id || r.id) === editingId);
    if (!currentReq) {
      cancelEdit();
      return;
    }
    const oldWeight = Number(currentReq.weightKg) || 0;
    // Available stock to allocate for this edit is current visible stock + previously allocated weight for this request
    const availableForEdit = Number(deliveredTotalKg) + oldWeight;
    if (newWeight > availableForEdit) {
      alert('Requested weight exceeds Total Items in Stock');
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/stock-requests/${editingId}`, { weightKg: newWeight });
      setRequests((prev) => prev.map((r) => ((r._id || r.id) === editingId ? res.data : r)));
      // Refresh summary to reflect new available amount
      fetchDeliveredTotal();
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update request');
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const res = await axios.get("http://localhost:5000/api/inventory");
      // Inventory items are considered raw materials list
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.materials) ? res.data.materials : []);
      setMaterials(list);
    } catch (err) {
      console.error("Failed to fetch materials", err);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get('http://localhost:5000/api/products');
      const list = Array.isArray(res.data?.products) ? res.data.products : (Array.isArray(res.data) ? res.data : []);
      setProducts(list);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchDeliveredTotal();
    fetchMaterials();
    fetchProducts();
    // Load existing requests from backend
    (async () => {
      try {
        const listRes = await axios.get('http://localhost:5000/api/stock-requests');
        setRequests(Array.isArray(listRes.data) ? listRes.data : []);
      } catch (err) {
        console.error('Failed to load stock requests list', err);
        setRequests([]);
      }
    })();
    const handler = () => { fetchMaterials(); };
    window.addEventListener('inventory:materials-updated', handler);
    return () => window.removeEventListener('inventory:materials-updated', handler);
  }, []);

  // no local persistence when using backend

  const resetRequestForm = () => {
    setRequestWeightKg("");
  };

  // IDs are generated by backend

  const submitRequest = async (e) => {
    e.preventDefault();
    const weight = Number(formatClamp3(requestWeightKg));
    if (Number.isNaN(weight) || weight < MIN_KG || weight > MAX_KG) {
      alert(`Please enter a valid requested weight in Kg (between ${MIN_KG} and ${MAX_KG})`);
      return;
    }
    if (weight > deliveredTotalKg) {
      alert('Requested weight exceeds Total Items in Stock');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/stock-requests', { weightKg: weight });
      // Prepend created request from backend
      setRequests((prev) => [res.data, ...prev]);
      setShowRequestForm(false);
      resetRequestForm();
      // Refresh summary
      fetchDeliveredTotal();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create request');
    }
  };

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
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
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

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-gray-600">Track current stock levels and inbound materials</p>
            </div>
            <button onClick={()=>{ fetchDeliveredTotal(); fetchMaterials(); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Refresh</button>
          </div>
        </header>

        <div className="p-6">
          {/* Centered KPI card */}
          <div className="grid grid-cols-1 place-items-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-xl text-center">
              <div className="text-sm text-gray-500">Total Items in Stock</div>
              <div className="mt-2 text-3xl font-bold">{loading ? '...' : `${Number(deliveredTotalKg).toFixed(3)} Kg`}</div>
              <div className="mt-2 text-xs text-gray-500">Total delivered to inventory (kg)</div>
            </div>
          </div>

          {/* CTA button below card */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowRequestForm(true)}
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Request to produce raw material
            </button>
          </div>

          {/* Request Form Modal */}
          {showRequestForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Production Request</h3>
                  <button className="text-gray-500 hover:text-gray-700" onClick={() => { setShowRequestForm(false); resetRequestForm(); }}>✕</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Total Items in Stock: <span className="font-semibold">{Number(deliveredTotalKg).toFixed(3)} Kg</span></p>
                <form onSubmit={submitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Requested weight (Kg)</label>
                    <input
                      type="number"
                      min="0.001"
                      max="100000"
                      step="0.001"
                      value={requestWeightKg}
                      onChange={(e)=> setRequestWeightKg(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      onBlur={(e)=> setRequestWeightKg(formatClamp3(e.target.value))}
                      placeholder="e.g., 12.500"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be deducted from Total Items in Stock upon submission.</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => { setShowRequestForm(false); resetRequestForm(); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Submit Request</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Raw materials cards (uniform grid, dashboard style without image) */}
          <div className="mt-6">
            {loadingMaterials ? (
              <div className="text-gray-600 text-center">Loading raw materials...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {materials.map((m) => {
                  const name = m.name || m.itemName || m.title || 'Material';
                  const code = m.itemCode || m.code || m.sku || '-';
                  const type = m.type || '-';
                  const color = m.color || '-';
                  // Stock is in Kg in Raw Materials table
                  const kg = Number(m.stock) || Number(m.weight) || Number(m.totalWeightKg) || 0;
                  const lastUpdated = m.lastUpdated ? new Date(m.lastUpdated).toLocaleString() : '-';
                  return (
                    <div key={m._id || code} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full min-h-[200px] flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        <span className="font-extrabold text-emerald-700">{Number(kg).toFixed(3)} Kg</span>
                        <span className="mx-2 text-gray-300">—</span>
                        {type}
                      </h2>
                      <p className="text-sm text-gray-500 mb-3">Code: <span className="font-semibold text-gray-700">{code}</span></p>
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 text-xs font-medium rounded-full">{color}</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-medium rounded-full">{name}</span>
                      </div>
                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Last updated: {lastUpdated}</p>
                      </div>
                    </div>
                  );
                })}
                {materials.length === 0 && (
                  <div className="text-gray-600 text-center w-full col-span-full">No raw materials found</div>
                )}
              </div>
            )}
          </div>

          {/* Requests Table */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Production Requests</h2>
              <div className="text-sm text-gray-500">Total Requests: <span className="font-semibold text-gray-900">{requests.length}</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-700">
                    <th className="py-2 px-3 font-semibold">Request ID</th>
                    <th className="py-2 px-3 font-semibold">Weight (Kg)</th>
                    <th className="py-2 px-3 font-semibold">Request time stamp</th>
                    <th className="py-2 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id || r.id} className="border-t text-sm">
                      <td className="py-2 px-3 font-mono">{r.requestId}</td>
                      <td className="py-2 px-3 font-semibold">{Number(r.weightKg || 0).toFixed(3)}</td>
                      <td className="py-2 px-3">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => beginEdit(r)}
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >Edit</button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td className="py-4 px-3 text-gray-500" colSpan={4}>No production requests yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Production Products Table */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Production Products</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Total Products: <span className="font-semibold text-gray-900">{products.length}</span></span>
                <button onClick={() => fetchProducts()} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">Refresh</button>
              </div>
            </div>
            {loadingProducts ? (
              <div className="text-gray-600">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-sm text-gray-700">
                      <th className="py-2 px-3 font-semibold">Image</th>
                      <th className="py-2 px-3 font-semibold">Product Name</th>
                      <th className="py-2 px-3 font-semibold">Category</th>
                      <th className="py-2 px-3 font-semibold">Description</th>
                      <th className="py-2 px-3 font-semibold text-right">Unit Price (LKR)</th>
                      <th className="py-2 px-3 font-semibold text-right">Reward Points</th>
                      <th className="py-2 px-3 font-semibold text-right">Stock</th>
                      <th className="py-2 px-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => (
                      <tr key={p._id || idx} className="border-t text-sm">
                        <td className="py-2 px-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded border" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">—</div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-medium">{p.name}</td>
                        <td className="py-2 px-3">{p.category || '—'}</td>
                        <td className="py-2 px-3 max-w-xs truncate" title={p.description}>{p.description || '—'}</td>
                        <td className="py-2 px-3 text-right font-semibold text-green-700">{Number(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right">{p.points ?? 0}</td>
                        <td className="py-2 px-3 text-right">{p.stock ?? 0}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(p.stock) < 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {Number(p.stock) < 10 ? 'Out of Stock' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td className="py-4 px-3 text-gray-500" colSpan={8}>No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Edit Request</h3>
                  <button className="text-gray-500 hover:text-gray-700" onClick={cancelEdit}>✕</button>
                </div>
                <form onSubmit={submitEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Requested weight (Kg)</label>
                    <input
                      type="number"
                      min="0.001"
                      max="100000"
                      step="0.001"
                      value={editWeightKg}
                      onChange={(e)=> setEditWeightKg(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      onBlur={(e)=> setEditWeightKg(formatClamp3(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
