import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import { CubeIcon, ClipboardDocumentListIcon, ChartBarIcon, ArrowTrendingUpIcon, DocumentChartBarIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

export default function InventoryReports() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [productionRequests, setProductionRequests] = useState([]);
  const [summary, setSummary] = useState({ deliveredTotalKg: 0, requestedTotalKg: 0, availableKg: 0 });
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState("");
  // Filters: Raw Materials
  const [materialNameQuery, setMaterialNameQuery] = useState("");
  const [materialDateQuery, setMaterialDateQuery] = useState("");

  const refMaterials = useRef(null);
  const refStock = useRef(null);
  const refDeliveries = useRef(null);
  const refAll = useRef(null);
  const refProduction = useRef(null);

  const nowString = () => new Date().toLocaleString();
  // Local today string (YYYY-MM-DD) for date input max
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Derived: filtered materials for Raw Materials Report (prefix match on type + optional date)
  const filteredMaterials = materials.filter((m) => {
    const needle = materialNameQuery.trim().toLowerCase();
    const nameOk = needle ? String(m.type || '').toLowerCase().startsWith(needle) : true;
    const dateOk = materialDateQuery
      ? (() => {
          if (!m.lastUpdated) return false;
          const dt = new Date(m.lastUpdated);
          if (isNaN(dt.getTime())) return false;
          const y = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          const dd = String(dt.getDate()).padStart(2, '0');
          const only = `${y}-${mm}-${dd}`;
          return only === materialDateQuery;
        })()
      : true;
    return nameOk && dateOk;
  });

  // Total stock for currently filtered materials and label for the processed form
  const filteredMaterialsTotalKg = filteredMaterials.reduce((sum, m) => sum + Number(m.stock || 0), 0);
  const filteredTypes = Array.from(new Set(filteredMaterials.map((m) => m.type).filter(Boolean)));
  const processedFormLabel = filteredTypes.length === 1
    ? filteredTypes[0]
    : (materialNameQuery.trim()
        ? materialNameQuery.trim().charAt(0).toUpperCase() + materialNameQuery.trim().slice(1)
        : 'Processed Form');
  const footerLabel = materialNameQuery.trim()
    ? `Total ${processedFormLabel} Stock`
    : 'Total Stock of all Processed Form';

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [inv, reqs, sum, del, prod] = await Promise.all([
        axios.get("http://localhost:5000/api/inventory"),
        axios.get("http://localhost:5000/api/stock-requests"),
        axios.get("http://localhost:5000/api/stock-requests/summary"),
        axios.get("http://localhost:5000/api/transport-requests", { params: { status: "Delivered" } }),
        axios.get("http://localhost:5000/api/production-requests")
      ]);
      const invList = Array.isArray(inv.data) ? inv.data : [];
      setMaterials(invList);
      setRequests(Array.isArray(reqs.data) ? reqs.data : []);
      setSummary({
        deliveredTotalKg: Number(sum.data?.deliveredTotalKg || 0),
        requestedTotalKg: Number(sum.data?.requestedTotalKg || 0),
        availableKg: Number(sum.data?.availableKg || 0)
      });
      setDeliveries(Array.isArray(del.data?.requests) ? del.data.requests : []);
      setProductionRequests(Array.isArray(prod.data) ? prod.data : []);
    } catch (err) {
      console.error("Failed to load reports data", err);
      setError("Failed to load reports data. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const printFullReport = () => {
    if (!refAll?.current) return;
    const content = refAll.current.innerHTML;
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.open();
    const logoUrl = '/ecocycle-logo.png?v=' + Date.now();
    win.document.write(`<!DOCTYPE html><html><head><title>Inventory Summary Report</title>
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h1 { font-size: 20px; margin-bottom: 8px; }
        h2 { font-size: 16px; margin: 12px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
        .report-section { page-break-after: always; }
        .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .print-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; break-inside: avoid; page-break-inside: avoid; margin-bottom: 12px; }
        .meta { color: #6b7280; font-size: 12px; margin-bottom: 12px; }
        img.print-img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
        /* Ensure summary cards render in print */
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
        .summary-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .summary-card .label { color: #6b7280; font-size: 12px; }
        .summary-card .value { font-size: 18px; font-weight: 700; }
        /* Hide interactive controls in print */
        .print-hide { display: none !important; }
        /* Full-bleed brand header */
        .brand-header { background: #0ea5a6; color: #fff; border-radius: 0; overflow: hidden; margin: 0; width: 100vw; border-bottom: 4px solid #f59e0b; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
        .brand-top { display: grid; grid-template-columns: 180px 1fr 180px; align-items: center; padding: 18px 22px; }
        .brand-logo { width: 168px; height: 168px; background: #0ea5a6; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
        .brand-logo img { width: 150px; height: 150px; object-fit: contain; background: transparent; border-radius: 50%; }
        .brand-info { line-height: 1.5; text-align: center; }
        .brand-title { font-size: 22px; font-weight: 600; letter-spacing: 0.4px; }
        .brand-sub { font-size: 14px; opacity: 0.98; }
        .report-title { text-align: center; font-size: 24px; color: #0f766e; font-weight: 900; margin: 16px 0 8px; }
        .title-underline { width: 240px; height: 2px; background: #f59e0b; margin: 8px auto 16px; border-radius: 3px; }
        .content { padding: 24px; }
        /* --- Tidy full report layout --- */
        .content section { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
        /* Put each top-level section on a new page for clarity */
        .content section + section { page-break-before: always; }
        /* Normalize inner card appearance */
        .content .rounded-2xl, .content .rounded-xl, .content .shadow, .content .shadow-sm { border-radius: 12px !important; box-shadow: none !important; }
        .content .border, .content .border-gray-200 { border-color: #e5e7eb !important; }
        .content .border-b { border-bottom: 1px solid #e5e7eb !important; margin-bottom: 8px; }
        .content .p-4 { padding: 12px !important; }
        .content .overflow-x-auto { overflow: visible !important; }
        .content h2 { font-size: 18px !important; margin: 0 0 6px !important; }
        .content table { margin-top: 10px; }
        /* Make grids simpler in print */
        .content .summary-grid, .content .summary-grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        .content .print-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
        /* Avoid rows splitting across pages */
        table, tr, td, th { page-break-inside: avoid; break-inside: avoid; }
      </style>
    </head><body>
      <div class="brand-header">
        <div class="brand-top">
          <div class="brand-logo"><img src="${logoUrl}" alt="EcoCycle Logo" crossorigin="anonymous" /></div>
          <div class="brand-info">
            <div class="brand-title">ECOCYCLE LANKA (PVT) LTD</div>
            <div class="brand-sub">123 Green Tech Park, Colombo 05, Sri Lanka</div>
            <div class="brand-sub" style="white-space: nowrap">Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com</div>
          </div>
          <div class="brand-spacer"></div>
        </div>
      </div>
      <div class="content">
        <div class="report-title">Inventory Summary Report</div>
        <div class="title-underline"></div>
        <!-- meta removed to avoid duplicate timestamps -->
        <div>${content}</div>
      </div>
      <script>
        (function(){
          const imgs = Array.from(document.images || []);
          Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })))
            .then(() => setTimeout(() => { window.print(); setTimeout(() => window.close(), 500); }, 100));
        })();
      </script>
    </body></html>`);
    win.document.close();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const printSection = (sectionRef, title) => {
    if (!sectionRef?.current) return;
    const content = sectionRef.current.innerHTML;
    const win = window.open("", "_blank", "width=1024,height=768");
    if (!win) return;
    win.document.open();
    const logoUrl = '/ecocycle-logo.png?v=' + Date.now();
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h1 { font-size: 20px; margin-bottom: 8px; }
        h2 { font-size: 16px; margin: 12px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
        .meta { color: #6b7280; font-size: 12px; margin-bottom: 12px; }
        .print-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .print-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; break-inside: avoid; page-break-inside: avoid; margin-bottom: 12px; }
        img.print-img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
        /* Ensure summary cards render in print */
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
        .summary-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .summary-card .label { color: #6b7280; font-size: 12px; }
        .summary-card .value { font-size: 18px; font-weight: 700; }
        /* Hide interactive controls in print */
        .print-hide { display: none !important; }
        /* Full-bleed brand header */
        .brand-header { background: #0ea5a6; color: #fff; border-radius: 0; overflow: hidden; margin: 0; width: 100vw; border-bottom: 4px solid #f59e0b; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
        .brand-top { display: grid; grid-template-columns: 180px 1fr 180px; align-items: center; padding: 18px 22px; }
        .brand-logo { width: 168px; height: 168px; background: #0ea5a6; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
        .brand-logo img { width: 200px; height: 200px; object-fit: contain; background: transparent; border-radius: 50%; }
        .brand-info { line-height: 1.5; text-align: center; }
        .brand-title { font-size: 25px; font-weight: 600; letter-spacing: 0.4px; }
        .brand-sub { font-size: 14px; opacity: 0.98; }
        .report-title { text-align: center; font-size: 24px; color: #0f766e; font-weight: 900; margin: 16px 0 8px; }
        .title-underline { width: 240px; height: 2px; background: #f59e0b; margin: 8px auto 35px; border-radius: 3px; }
        .content { padding: 24px; }
      </style>
    </head><body>
      <div class="brand-header">
        <div class="brand-top">
          <div class="brand-logo"><img src="${logoUrl}" alt="EcoCycle Logo" crossorigin="anonymous" /></div>
          <div class="brand-info">
            <div class="brand-title">ECOCYCLE LANKA (PVT) LTD</div>
            <div class="brand-sub">123 Green Tech Park, Colombo 05, Sri Lanka</div>
            <div class="brand-sub" style="white-space: nowrap">Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com</div>
          </div>
          <div class="brand-spacer"></div>
        </div>
      </div>
      <div class="content">
        <div class="report-title">${title}</div>
        <div class="title-underline"></div>
        <!-- meta removed to avoid duplicate timestamps -->
        <div>${content}</div>
      </div>
      <script>
        (function(){
          const imgs = Array.from(document.images || []);
          Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })))
            .then(() => setTimeout(() => { window.print(); setTimeout(() => window.close(), 500); }, 100));
        })();
      </script>
    </body></html>`);
    win.document.close();
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
              <p className="text-sm text-gray-500">Reports</p>
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
          <Link to="/inventory/analytics" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link to="/inventory/materials" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100">
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link to="/inventory/reports" className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
              <p className="text-gray-600">Review and download PDF reports of all inventory sections</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchAll} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Refresh</button>
              <button onClick={printFullReport} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Download Full Report</button>
            </div>
          </div>
        </header>

        <div ref={refAll} className="p-6 space-y-8">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}
          {loading && <div className="text-gray-600">Loading data...</div>}

          {/* Raw Materials Report */}
          <section className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Raw Materials Report</h2>
                <p className="text-sm text-gray-500">Inventory materials with current stock</p>
              </div>
              <button onClick={() => printSection(refMaterials, 'Inventory Raw Materials Report')} className="print-hide px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Download PDF</button>
            </div>
            <div ref={refMaterials} className="p-4 overflow-x-auto">
              <div className="text-sm text-gray-500 mb-3">Generated at: {nowString()}</div>
              {/* Filters */}
              <div className="print-hide flex flex-col md:flex-row items-start md:items-end gap-3 mb-4">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Processed Form</label>
                  <input
                    type="text"
                    value={materialNameQuery}
                    onKeyDown={(e) => {
                      const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                      const isLetter = /^[a-zA-Z]$/.test(e.key);
                      const isSpace = e.key === ' ';
                      if (!isLetter && !isSpace && !allowedControl.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const v = e.target.value;
                      const lettersOnly = /^[\p{L}\s]*$/u; // letters and spaces only (all locales)
                      if (!lettersOnly.test(v)) return; // reject numbers/specials
                      setMaterialNameQuery(v);
                    }}
                    placeholder="Search Processed Form..."
                    className="border rounded-md px-3 py-2 text-sm w-64"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    max={todayStr}
                    value={materialDateQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v && v > todayStr) return; // block future dates
                      setMaterialDateQuery(v);
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-48"
                  />
                </div>
              </div>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-700">
                    <th className="py-2 px-3 font-semibold">Code</th>
                    <th className="py-2 px-3 font-semibold">Type of Bottle</th>
                    <th className="py-2 px-3 font-semibold">Processed Form</th>
                    <th className="py-2 px-3 font-semibold">Color</th>
                    <th className="py-2 px-3 font-semibold">Stock (Kg)</th>
                    <th className="py-2 px-3 font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((m) => (
                    <tr key={m._id} className="border-t text-sm">
                      <td className="py-2 px-3 font-mono">{m.itemCode}</td>
                      <td className="py-2 px-3">{m.name}</td>
                      <td className="py-2 px-3">{m.type}</td>
                      <td className="py-2 px-3">{m.color}</td>
                      <td className="py-2 px-3 font-semibold">{Number(m.stock).toFixed(3)}</td>
                      <td className="py-2 px-3">{m.lastUpdated ? new Date(m.lastUpdated).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {materials.length > 0 && filteredMaterials.length === 0 && (
                    <tr>
                      <td className="py-4 px-3 text-gray-500" colSpan={6}>No matching results for the selected Processed Form and date.</td>
                    </tr>
                  )}
                  {materials.length === 0 && (
                    <tr>
                      <td className="py-4 px-3 text-gray-500" colSpan={6}>No materials found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="py-3 px-3 text-sm font-semibold text-gray-800">
                      {footerLabel} = {filteredMaterialsTotalKg.toFixed(3)} Kg
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Stock Summary & Requests Report */}
          <section className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Stock Summary & Requests</h2>
                <p className="text-sm text-gray-500">Available, delivered, requested totals and request list</p>
              </div>
              <button onClick={() => printSection(refStock, 'Inventory Stock Summary & Requests')} className="print-hide px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Download PDF</button>
            </div>
            <div ref={refStock} className="p-4 overflow-x-auto">
              <div className="text-sm text-gray-500 mb-3">Generated at: {nowString()}</div>
              <div className="summary-grid grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="summary-card rounded border p-3">
                  <div className="label text-xs text-gray-500">Delivered Total (Kg)</div>
                  <div className="value text-xl font-bold">{summary.deliveredTotalKg}</div>
                </div>
                <div className="summary-card rounded border p-3">
                  <div className="label text-xs text-gray-500">Requested Total (Kg)</div>
                  <div className="value text-xl font-bold">{summary.requestedTotalKg}</div>
                </div>
                <div className="summary-card rounded border p-3">
                  <div className="label text-xs text-gray-500">Available (Kg)</div>
                  <div className="value text-xl font-bold">{summary.availableKg}</div>
                </div>
              </div>
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-700">
                    <th className="py-2 px-3 font-semibold">Request ID</th>
                    <th className="py-2 px-3 font-semibold">Weight (Kg)</th>
                    <th className="py-2 px-3 font-semibold">Request Time</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id} className="border-t text-sm">
                      <td className="py-2 px-3 font-mono">{r.requestId}</td>
                      <td className="py-2 px-3 font-semibold">{r.weightKg}</td>
                      <td className="py-2 px-3">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td className="py-4 px-3 text-gray-500" colSpan={3}>No requests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Production Report */}
          <section className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Production Report</h2>
                <p className="text-sm text-gray-500">Production requests summary and details</p>
              </div>
              <button onClick={() => printSection(refProduction, 'Inventory Production Report')} className="print-hide px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Download PDF</button>
            </div>
            <div ref={refProduction} className="p-4">
              <div className="text-sm text-gray-500 mb-3">Generated at: {nowString()}</div>
              {/* Summary cards */}
              <div className="summary-grid-4 grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div className="summary-card rounded border p-3"><div className="label text-xs text-gray-500">Total Requests</div><div className="value text-xl font-bold">{productionRequests.length}</div></div>
                <div className="summary-card rounded border p-3"><div className="label text-xs text-gray-500">Pending</div><div className="value text-xl font-bold">{productionRequests.filter(r => (r.status||'').toLowerCase()==='pending').length}</div></div>
                <div className="summary-card rounded border p-3"><div className="label text-xs text-gray-500">Approved</div><div className="value text-xl font-bold">{productionRequests.filter(r => (r.status||'').toLowerCase()==='approved').length}</div></div>
                <div className="summary-card rounded border p-3"><div className="label text-xs text-gray-500">Rejected</div><div className="value text-xl font-bold">{productionRequests.filter(r => (r.status||'').toLowerCase()==='rejected').length}</div></div>
              </div>
              {/* Cards list */}
              <div className="print-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productionRequests.map((pr) => (
                  <div key={pr._id} className="print-card border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-700 font-semibold">{pr.team}</div>
                      <div className="text-xs text-gray-500 font-mono">{pr.requestId || pr._id?.slice(-6)}</div>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Qty:</span> {pr.requestedQty}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Material:</span> {pr.inventoryItemId?.name || '-'} {pr.inventoryItemId?.type ? `(${pr.inventoryItemId.type})` : ''}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Priority:</span> {pr.priority || 'Medium'}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Status:</span> {pr.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Requested:</span> {pr.requestDate ? new Date(pr.requestDate).toLocaleString() : new Date(pr.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {productionRequests.length === 0 && (
                  <div className="text-gray-500">No production requests found</div>
                )}
              </div>
            </div>
          </section>

          {/* Delivery Records Report */}
          <section className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Delivery Records (Delivered)</h2>
                <p className="text-sm text-gray-500">Transport requests marked as Delivered</p>
              </div>
              <button onClick={() => printSection(refDeliveries, 'Inventory Delivery Records (Delivered)')} className="print-hide px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Download PDF</button>
            </div>
            <div ref={refDeliveries} className="p-4">
              <div className="text-sm text-gray-500 mb-3">Generated at: {nowString()}</div>

              {/* Header: feature the first delivered record */}
              {deliveries.length > 0 && (
                <div className="print-card border rounded-xl p-4 shadow-sm mb-4">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Featured Delivery</h3>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-700 font-semibold">{deliveries[0].collectorName || '—'}</div>
                    <div className="text-xs text-gray-500 font-mono">{deliveries[0].requestId || (deliveries[0]._id?.slice(-6) || '—')}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">{deliveries[0].bottleType}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">Qty: {deliveries[0].quantity}</span>
                  </div>
                  <div className="text-xs text-gray-500">Delivered: {deliveries[0].updatedAt ? new Date(deliveries[0].updatedAt).toLocaleString() : (deliveries[0].deliveredAt ? new Date(deliveries[0].deliveredAt).toLocaleString() : '—')}</div>
                </div>
              )}

              {/* Remaining delivered records */}
              <div className="print-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveries.slice(1).map((d) => (
                  <div key={d._id} className="print-card border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-700 font-semibold">{d.collectorName || '—'}</div>
                      <div className="text-xs text-gray-500 font-mono">{d.requestId || (d._id?.slice(-6) || '—')}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">{d.bottleType}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">Qty: {d.quantity}</span>
                    </div>
                    <div className="text-xs text-gray-500">Delivered: {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : (d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : '—')}</div>
                  </div>
                ))}
                {deliveries.length === 0 && (
                  <div className="text-gray-500">No delivered records</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
