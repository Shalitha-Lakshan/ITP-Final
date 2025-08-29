import React, { useState } from "react";
import {
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function InventoryForms() {
  const [bottles, setBottles] = useState("");
  const [sorting, setSorting] = useState({ mud: "", rices: "", powder: "" });

  const handleBottleSubmit = (e) => {
    e.preventDefault();
    alert(`✅ Received ${bottles} bottles from transporter.`);
    setBottles("");
  };

  const handleSortingSubmit = (e) => {
    e.preventDefault();
    alert(
      `✅ Sorting saved: Mud=${sorting.mud} Kg, Rices=${sorting.rices} Kg, Powder=${sorting.powder} Kg`
    );
    setSorting({ mud: "", rices: "", powder: "" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-green-600 text-white w-64 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">EcoRecycle</h2>
        <nav className="space-y-4">
          <Link
            to="/inventory"
            className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"
          >
            <ChartBarIcon className="w-5 h-5" /> Dashboard
          </Link>
          <Link
            to="/inventory/forms"
            className="flex items-center gap-2 bg-green-700 p-2 rounded-lg transition"
          >
            <CubeIcon className="w-5 h-5" /> Inventory Forms
          </Link>
          <Link
            to="/inventory/sorting"
            className="flex items-center gap-2 hover:bg-green-700 p-2 rounded-lg transition"
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
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Forms
          </h1>
          <Link to="/inventory/profile">
            <UserCircleIcon className="w-10 h-10 text-gray-700 cursor-pointer hover:text-green-600 transition" />
          </Link>
        </div>

        {/* Receive Bottles Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <InboxArrowDownIcon className="w-6 h-6 text-green-600" /> Receive Bottles
          </h3>
          <form onSubmit={handleBottleSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="Number of bottles"
              value={bottles}
              onChange={(e) => setBottles(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Sorting Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Sorting Details</h3>
          <form onSubmit={handleSortingSubmit} className="space-y-3">
            <input
              type="number"
              placeholder="Mud Color (Kg)"
              value={sorting.mud}
              onChange={(e) => setSorting({ ...sorting, mud: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="number"
              placeholder="Rices (Kg)"
              value={sorting.rices}
              onChange={(e) => setSorting({ ...sorting, rices: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="number"
              placeholder="Powder (Kg)"
              value={sorting.powder}
              onChange={(e) => setSorting({ ...sorting, powder: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              Save Sorting
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
