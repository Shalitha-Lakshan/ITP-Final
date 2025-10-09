import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import { CubeIcon, ChartBarIcon, DocumentChartBarIcon, ArrowTrendingUpIcon, ClipboardDocumentListIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

export default function InventoryAnalytics() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formatters for displaying Kg with three decimals
  const formatKg = (v) => `${Number(v || 0).toFixed(3)} Kg`;
  const formatKgTick = (v) => Number(v || 0).toFixed(3);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:5000/api/inventory");
        setInventory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load inventory for analytics", err);
        setError("Failed to load inventory. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStockKg = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.stock) || 0), 0), [inventory]);
  const totalItems = useMemo(() => inventory.length, [inventory]);
  const lowStockCount = useMemo(() => inventory.filter(i => (Number(i.stock) || 0) < 10).length, [inventory]);

  const topMaterials = useMemo(() => {
    return [...inventory]
      .map(i => ({ name: `${i.name} (${i.type})`, stock: Number(i.stock) || 0 }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10);
  }, [inventory]);

  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#00B8D9", "#FF6B6B", "#6C5CE7", "#00C853"]; 
  const colorDistribution = useMemo(() => {
    const groups = inventory.reduce((acc, i) => {
      const key = i.color || "Unknown";
      acc[key] = (acc[key] || 0) + (Number(i.stock) || 0);
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Additional analytics datasets
  const typeDistribution = useMemo(() => {
    const groups = inventory.reduce((acc, i) => {
      const key = i.type || "Unknown";
      acc[key] = (acc[key] || 0) + (Number(i.stock) || 0);
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const stackedByTypeColor = useMemo(() => {
    // Build set of colors and types first
    const typeMap = new Map();
    const allColors = new Set();
    inventory.forEach((i) => {
      const type = i.type || "Unknown";
      const color = i.color || "Unknown";
      const stock = Number(i.stock) || 0;
      allColors.add(color);
      if (!typeMap.has(type)) typeMap.set(type, {});
      typeMap.get(type)[color] = (typeMap.get(type)[color] || 0) + stock;
    });
    // Convert to array of { type, [color]: value }
    return Array.from(typeMap.entries()).map(([type, colorObj]) => ({ type, ...colorObj }));
  }, [inventory]);

  const histogramData = useMemo(() => {
    const buckets = [
      { label: "0–10", min: 0, max: 10 },
      { label: "10–25", min: 10, max: 25 },
      { label: "25–50", min: 25, max: 50 },
      { label: "50–100", min: 50, max: 100 },
      { label: "100+", min: 100, max: Infinity },
    ];
    const counts = buckets.map(b => ({ name: b.label, count: 0 }));
    inventory.forEach((i) => {
      const s = Number(i.stock) || 0;
      const idx = buckets.findIndex(b => s >= b.min && s < b.max);
      if (idx >= 0) counts[idx].count += 1;
    });
    return counts;
  }, [inventory]);

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
              <p className="text-sm text-gray-500">Analytics</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link to="/inventory" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Overview</span>
          </Link>
          <Link to="/inventory/stock" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </Link>
          <Link to="/inventory/requests" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link to="/inventory/deliveries" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="font-medium">Delivery Records</span>
          </Link>
          <Link to="/inventory/analytics" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link to="/inventory/materials" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link to="/inventory/reports" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
              <p className="text-gray-600">Insights into inventory composition and stock levels</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
          {loading && <div className="text-gray-600">Loading analytics...</div>}

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="text-emerald-100 text-sm font-medium">Total Stock (Kg)</div>
              <div className="text-3xl font-bold">{Number(totalStockKg).toFixed(3)} Kg</div>
            </div>
            <Link to="/inventory/materials" className="block">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6 hover:from-blue-600 hover:to-blue-700 transition-colors" role="button" title="Go to Raw Materials">
                <div className="text-blue-100 text-sm font-medium">Material Types</div>
                <div className="text-3xl font-bold">{totalItems}</div>
              </div>
            </Link>
            <Link to="/inventory/materials?highlight=low" state={{ highlightLowStock: true }} className="block">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6 hover:from-orange-600 hover:to-orange-700 transition-colors" role="button" title="View Low Stock in Materials">
                <div className="text-orange-100 text-sm font-medium">Low Stock (&lt; 10 Kg)</div>
                <div className="text-3xl font-bold">{lowStockCount}</div>
              </div>
            </Link>
          </div>

          {/* Top Materials by Stock */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Materials by Stock</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topMaterials} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatKgTick} />
                <Tooltip formatter={(value) => formatKg(value)} />
                <Legend />
                <Bar dataKey="stock" name="Stock (Kg)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Color Distribution by Total Kg */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Color Distribution (by Kg)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={colorDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {colorDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
                <Tooltip formatter={(value) => formatKg(value)} />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Type Distribution by Total Kg */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Processed Form Distribution (by Kg)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {typeDistribution.map((entry, idx) => (
                    <Cell key={`cell-type-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
                <Tooltip formatter={(value) => formatKg(value)} />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Stacked Bar: Stock by Color per Processed Form */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Stock by Color per Processed Form</h2>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={stackedByTypeColor} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis tickFormatter={formatKgTick} />
                <Tooltip formatter={(value, name) => [formatKg(value), name]} />
                <Legend />
                {/* Dynamically render a Bar per color key in dataset */}
                {Array.from(
                  stackedByTypeColor.reduce((set, row) => {
                    Object.keys(row).forEach((k) => {
                      if (k !== 'type') set.add(k);
                    });
                    return set;
                  }, new Set())
                ).map((colorName, idx) => (
                  <Bar key={colorName} dataKey={colorName} stackId="a" fill={COLORS[idx % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Histogram: Count of Items by Stock Range */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Item Count by Stock Range</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Items" fill="#10B981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Low Stock List */}
          <section className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Low Stock Items (&lt; 10 Kg)</h2>
              <Link to="/inventory/materials?highlight=low" state={{ highlightLowStock: true }} className="text-blue-600 hover:underline">View in Materials</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-700">
                    <th className="py-2 px-3 font-semibold">Item</th>
                    <th className="py-2 px-3 font-semibold">Color</th>
                    <th className="py-2 px-3 font-semibold">Type</th>
                    <th className="py-2 px-3 font-semibold">Stock (Kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.filter(i => (Number(i.stock) || 0) < 10).map((i) => (
                    <tr key={i._id} className="border-t text-sm">
                      <td className="py-2 px-3 font-semibold">{i.name}</td>
                      <td className="py-2 px-3">{i.color}</td>
                      <td className="py-2 px-3">{i.type}</td>
                      <td className="py-2 px-3">{Number(i.stock || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                  {inventory.filter(i => (Number(i.stock) || 0) < 10).length === 0 && (
                    <tr><td className="py-4 px-3 text-gray-500" colSpan={4}>No low stock items 🎉</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
