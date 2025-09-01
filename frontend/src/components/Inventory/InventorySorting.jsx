import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  CubeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function InventorySorting() {
  const [sorting, setSorting] = useState({ mud: 0, rices: 0, powder: 0 });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert(`Updated Sorting:\nMud: ${sorting.mud} Kg\nRices: ${sorting.rices} Kg\nPowder: ${sorting.powder} Kg`);
  };

  const sortingData = [
    { name: "Mud Color", value: sorting.mud },
    { name: "Rices", value: sorting.rices },
    { name: "Powder", value: sorting.powder },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-green-600 text-white w-64 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">EcoCycle</h2>
        <nav className="space-y-4">
          <Link
            to="/inventory"
            className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"
          >
            <ChartBarIcon className="w-5 h-5" /> Dashboard
          </Link>
          <Link
            to="/inventory/forms"
            className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"
          >
            <CubeIcon className="w-5 h-5" /> Inventory Forms
          </Link>
          <Link
            to="/inventory/sorting"
            className="flex items-center gap-2 bg-green-700 p-2 rounded-lg"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" /> Sorting
          </Link>
          <Link
            to="/inventory/reports"
            className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"
          >
            <DocumentChartBarIcon className="w-5 h-5" /> Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Sorting Management</h1>
          <Link to="/inventory/profile">
            <UserCircleIcon className="w-10 h-10 text-gray-700 cursor-pointer hover:text-green-600 transition" />
          </Link>
        </div>

        {/* Update Sorting Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-lg font-semibold mb-4">Update Sorting Stock</h3>
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Mud Color (Kg)"
              value={sorting.mud}
              maxLength={3}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,3}$/.test(val)) {
                  setSorting({ ...sorting, mud: val === "" ? 0 : Number(val) });
                }
              }}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Rices (Kg)"
              value={sorting.rices}
              maxLength={3}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,3}$/.test(val)) {
                  setSorting({ ...sorting, rices: val === "" ? 0 : Number(val) });
                }
              }}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Powder (Kg)"
              value={sorting.powder}
              maxLength={3}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,3}$/.test(val)) {
                  setSorting({
                    ...sorting,
                    powder: val === "" ? 0 : Number(val),
                  });
                }
              }}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Sorting Stock Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Current Sorting Stock</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
