import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import { LayoutDashboard, CheckCircle, FileText, Factory, Package, TrendingUp, AlertTriangle, Printer, Settings } from "lucide-react";

const ProductionReportPage = () => {
  const refApproved = useRef(null);
  const refPlans = useRef(null);
  const [acceptedMaterials, setAcceptedMaterials] = useState([]);
  const [plans, setPlans] = useState([]);
  const [machines, setMachines] = useState([]);
  const [qualityRecords, setQualityRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const todayStr = new Date().toISOString().slice(0,10);

  const fetchAcceptedMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/production-requests/status/Approved');
      setAcceptedMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Report: fetchAcceptedMaterials', e);
    }
  };

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
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
        .no-print { display: none !important; }
        /* Full-bleed header (edge-to-edge) */
        .brand-header { background: #0ea5a6; color: #fff; border-radius: 0; overflow: hidden; margin: 0; width: 100vw; border-bottom: 4px solid #f59e0b; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }
        .brand-top { display: grid; grid-template-columns: 180px 1fr 180px; align-items: center; padding: 18px 22px; }
        .content { padding: 24px; }
        .brand-logo { width: 120px; height: 120px; background: #0ea5a6; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
        .brand-logo img { width: 200px; height: 200px; object-fit: contain; background: transparent; border-radius: 50%; }
        .brand-info { line-height: 1.4; text-align: center; }
        .brand-title { font-size: 30px; font-weight: 600; }
        .brand-sub { font-size: 13px; }
        .report-title { text-align: center; font-size: 20px; color: #0f766e; font-weight: 800; margin: 12px 0 6px; }
        .title-underline { width: 200px; height: 4px; background: #f59e0b; margin: 6px auto 0; border-radius: 2px; }
        .meta-top { color: #6b7280; font-size: 12px; margin: 8px 0; }
      </style>
    </head><body>
      <div class="brand-header">
        <div class="brand-top">
          <div class="brand-logo"><img src="${logoUrl}" alt="EcoCycle Logo" crossorigin="anonymous" /></div>
          <div class="brand-info">
            <div class="brand-title">ECOCYCLE LANKA (PVT) LTD</div>
            <div class="brand-sub">123 Green Tech Park, Colombo 05, Sri Lanka</div>
            <div class="brand-sub">Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com</div>
          </div>
          <div class="brand-spacer"></div>
        </div>
      </div>
      <div class="content">
        <div class="report-title">${title}</div>
        <div class="title-underline"></div>
        <div>${content}</div>
      </div>
      <script>
        (function(){
          // Insert Generated At above the first table of the section
          const firstTable = document.querySelector('table');
          if (firstTable && firstTable.parentNode) {
            const meta = document.createElement('div');
            meta.className = 'meta-top';
            meta.textContent = 'Generated at: ' + new Date().toLocaleString();
            firstTable.parentNode.insertBefore(meta, firstTable);
          }
          const imgs = Array.from(document.images || []);
          Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })))
            .then(() => setTimeout(() => { window.print(); setTimeout(() => window.close(), 500); }, 100));
        })();
      </script>
    </body></html>`);
    win.document.close();
  };

  const fetchProductionPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/production-plans');
      setPlans(Array.isArray(res.data?.plans) ? res.data.plans : Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Report: fetchProductionPlans', e);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/machines');
      setMachines(Array.isArray(res.data?.machines) ? res.data.machines : Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Report: fetchMachines', e);
    }
  };

  const fetchQuality = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quality');
      setQualityRecords(Array.isArray(res.data?.records) ? res.data.records : Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Report: fetchQuality', e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAcceptedMaterials(),
      fetchProductionPlans(),
      fetchMachines(),
      fetchQuality(),
    ]).finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { name: "Overview", key: "overview", icon: <LayoutDashboard size={20} /> },
    { name: "Products", key: "products", icon: <Package size={20} /> },
    { name: "Production Planning", key: "planning", icon: <Factory size={20} /> },
    { name: "Raw Materials", key: "materials", icon: <Package size={20} /> },
    { name: "Quality Control", key: "quality", icon: <Settings size={20} /> },
    { name: "Analytics", key: "analytics", icon: <TrendingUp size={20} /> },
    { name: "Reports", key: "reports", icon: <FileText size={20} /> },
  ];

  const approvedRequestsCount = acceptedMaterials.length;
  const approvedTotalQty = acceptedMaterials.reduce((sum, r) => sum + (parseFloat(r?.requestedQty) || 0), 0);
  const inProgressPlans = plans.filter(p => p.status === 'In Progress').length;
  const completedPlans = plans.filter(p => p.status === 'Completed').length;
  const machinesRunning = machines.filter(m => (m.status || '').toLowerCase() === 'running').length;
  const defectRate = (() => {
    const totalInspected = qualityRecords.reduce((s, q) => s + (parseFloat(q?.inspectedQuantity) || 0), 0);
    const totalDefects = qualityRecords.reduce((s, q) => s + (parseFloat(q?.defectCount) || 0), 0);
    if (!totalInspected) return 0;
    return (totalDefects / totalInspected) * 100;
  })();

  // Filters for Approved Raw Materials
  const filteredApproved = acceptedMaterials.filter((r) => {
    // Type search (on inventoryItemId.type) with case-insensitive prefix match
    const type = String(r?.inventoryItemId?.type || '').toLowerCase();
    const needle = typeQuery.trim().toLowerCase();
    if (needle && !type.startsWith(needle)) return false;
    // Date range filter by approvedDate (inclusive)
    const approved = r?.approvedDate ? new Date(r.approvedDate) : null;
    if (fromDate) {
      const from = new Date(fromDate);
      // normalize to start of day
      from.setHours(0,0,0,0);
      if (!approved || approved < from) return false;
    }
    return true;
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = 'Production Report';
    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    window.print();
    // Fallback restore in case afterprint isn't fired
    setTimeout(restoreTitle, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body, #root { background: white !important; }
          /* Hide navigation, headers, and any explicit no-print */
          aside, header, nav, .no-print { display: none !important; }
          /* Expand content to full width */
          .print-content { width: 100% !important; margin: 0 !important; padding: 0 0 !important; }
          /* Remove gradients and shadows for clean print */
          .bg-gradient-to-br, .bg-white { background: white !important; }
          .shadow, .shadow-lg, .shadow-xl { box-shadow: none !important; }
          /* Avoid page breaks in headers */
          h1, h2, h3 { page-break-after: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          /* Show print-only header */
          .only-print { display: block !important; }
        }
        /* Hide print-only header on screen */
        .only-print { display: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="no-print w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Factory className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Production Hub</h2>
              <p className="text-sm text-gray-500">Manufacturing Operations</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            item.key === 'reports' ? (
              <div
                key={item.key}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </div>
            ) : item.key === 'analytics' ? (
              <Link
                key={item.key}
                to="/production/analytics"
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ) : (
              <Link
                key={item.key}
                to={`/production?tab=${item.key}`}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          ))}
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto print-content">
      {/* Print-only brand header and subtopic (full-bleed) */}
      <div className="only-print" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        <div style={{
          background: '#0ea5a6',
          color: '#fff',
          borderRadius: 0,
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
          borderBottom: '4px solid #f59e0b'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 180px', alignItems: 'center', padding: '18px 22px' }}>
            <div style={{ width: '140px', height: '140px', background: '#0ea5a6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/ecocycle-logo.png" alt="EcoCycle Logo" style={{ width: '126px', height: '126px', objectFit: 'contain', borderRadius: '50%' }} />
            </div>
            <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
              <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '0.4px' }}>ECOCYCLE LANKA (PVT) LTD</div>
              <div style={{ fontSize: '13px' }}>123 Green Tech Park, Colombo 05, Sri Lanka</div>
              <div style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com</div>
            </div>
            <div></div>
          </div>
        </div>
        <div style={{ padding: '16px 24px 8px' }}>
          <div style={{ textAlign: 'center', color: '#0f766e', fontWeight: 800, fontSize: '18pt', marginTop: '-2px' }}>Summery Procution Report</div>
          <div style={{ width: '220px', height: '4px', background: '#f59e0b', margin: '6px auto 8px', borderRadius: '2px' }}></div>
        </div>
      </div>
      <header className="no-print bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Reports</h1>
            <p className="text-gray-600">Summary of production KPIs and records</p>
          </div>
        </div>
        <div>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <Printer size={18} /> Print / Export
          </button>
        </div>
      </header>

      <div className="p-6">
      {loading ? (
        <div className="text-center text-gray-600">Loading report...</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Approved Raw Materials</div>
                  <div className="text-3xl font-bold">{approvedRequestsCount}</div>
                  <div className="text-xs text-gray-500">Stock(Kg): {approvedTotalQty}</div>
                </div>
                <CheckCircle className="text-emerald-500" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Plans In Progress</div>
                  <div className="text-3xl font-bold">{inProgressPlans}</div>
                  <div className="text-xs text-gray-500">Completed: {completedPlans}</div>
                </div>
                <TrendingUp className="text-blue-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Machines Running</div>
                  <div className="text-3xl font-bold">{machinesRunning}</div>
                  <div className="text-xs text-gray-500">Total: {machines.length}</div>
                </div>
                <Factory className="text-purple-600" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Defect Rate</div>
                  <div className="text-3xl font-bold">{defectRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">from {qualityRecords.length} inspections</div>
                </div>
                <AlertTriangle className="text-orange-600" />
              </div>
            </div>
          </div>

          {/* Tables - stacked one after another */}
          <div className="grid grid-cols-1 gap-6">
            {/* Approved Materials */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5" ref={refApproved}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Package size={18}/> Approved Raw Materials Report</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{new Date().toLocaleString()}</span>
                  <button onClick={() => printSection(refApproved, 'Approved Raw Materials Report')} className="no-print inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs">
                    <Printer size={14}/> Download
                  </button>
                </div>
              </div>
              {/* Filters */}
              <div className="no-print mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={typeQuery}
                    onChange={(e)=> setTypeQuery(e.target.value)}
                    onKeyDown={(e)=>{
                      const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                      const isLetter = /^[a-zA-Z]$/.test(e.key);
                      const isSpace = e.key === ' ';
                      if (!isLetter && !isSpace && !allowed.includes(e.key)) e.preventDefault();
                    }}
                    placeholder="Search by type..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    max={todayStr}
                    onChange={(e)=> {
                      const v = e.target.value;
                      if (v && v > todayStr) return; // disallow future
                      setFromDate(v);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From date"
                  />
                  <button
                    type="button"
                    onClick={()=>{ setTypeQuery(''); setFromDate(''); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >Clear</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-2">Material</th>
                      <th className="py-2 pr-2">Color</th>
                      <th className="py-2 pr-2">Type</th>
                      <th className="py-2 pr-6 text-right">Qty (Kg)</th>
                      <th className="py-2 pr-2 pl-6">Approved Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApproved.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-500">No approved requests</td></tr>
                    ) : (
                      filteredApproved.map((r) => (
                        <tr key={r._id} className="border-b last:border-b-0">
                          <td className="py-2 pr-2">{r?.inventoryItemId?.name || '-'}</td>
                          <td className="py-2 pr-2">{r?.inventoryItemId?.color || '-'}</td>
                          <td className="py-2 pr-2">{r?.inventoryItemId?.type || '-'}</td>
                          <td className="py-2 pr-6 text-right">{r?.requestedQty}</td>
                          <td className="py-2 pr-2 pl-6">{r?.approvedDate ? new Date(r.approvedDate).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Production Plans */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5" ref={refPlans}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Factory size={18}/> Production Plans Report</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{plans.length} total</span>
                  <button onClick={() => printSection(refPlans, 'Production Plans Report')} className="no-print inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs">
                    <Printer size={14}/> Download
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-2">Product</th>
                      <th className="py-2 pr-6 text-right">Qty</th>
                      <th className="py-2 pr-2 pl-6">Start</th>
                      <th className="py-2 pr-2">End</th>
                      <th className="py-2 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-500">No plans</td></tr>
                    ) : (
                      plans.slice(0, 10).map((p) => (
                        <tr key={p._id} className="border-b last:border-b-0">
                          <td className="py-2 pr-2">{p.productName || '-'}</td>
                          <td className="py-2 pr-6 text-right">{p.quantity}</td>
                          <td className="py-2 pr-2 pl-6">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</td>
                          <td className="py-2 pr-2">{p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</td>
                          <td className="py-2 pr-2">{p.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      </div>
    </div>
  );
};

export default ProductionReportPage;
