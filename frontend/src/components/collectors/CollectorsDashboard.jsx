// src/components/collectors/CollectorsDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import {
  Squares2X2Icon,
  PlusIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helpers
const nowIso = () => new Date().toISOString();

// Preload logo from public folder for PDF header
const loadHeaderLogo = () => new Promise((resolve) => {
  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = window.location.origin + '/ecocycle-logo.png';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  } catch { resolve(null); }
});

// Standard PDF header for all reports (auto fits portrait/landscape)
// Optionally provide logoImg (HTMLImageElement) to render on the left
const addStandardPdfHeader = (doc, title, subtitle = '', logoImg = null) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Header bar full width (brand teal #0c9387)
  doc.setFillColor(12, 147, 135);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Logo at left if available
  if (logoImg) {
    try {
      const logoW = 32; // mm (increased slightly)
      const logoH = (logoImg.height * logoW) / logoImg.width;
      const x = 18; // move a bit towards the text
      const y = 15 - (logoH / 2);
      doc.addImage(logoImg, 'PNG', x, y, logoW, logoH);
    } catch {}
  }

  // Company text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ECOCYCLE LANKA (PVT) LTD', centerX, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', centerX, 20, { align: 'center' });
  doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', centerX, 25, { align: 'center' });
  
  // Report title and date
  doc.setTextColor(12, 147, 135); // #0c9387
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, centerX, 45, { align: 'center' });
  // reset to black for the rest of the header text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 52);
  if (subtitle) {
    // Allow multi-line subtitle
    const lines = Array.isArray(subtitle) ? subtitle : doc.splitTextToSize(String(subtitle), pageWidth - 40);
    doc.text(lines, 20, 59);
  }
  
  return subtitle ? 70 : 60; // Return Y position after header
};

export default function CollectorsDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Uncontrolled form refs for Add Collection (prevents focus loss when typing)
  const phoneRef = useRef(null);
  const qtyRef = useRef(null);
  const locationRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  // Data
  const [notifications, setNotifications] = useState([]);
  // Stock will be derived from collections data
  const [transportReqs, setTransportReqs] = useState([]);
  // Recent Collections loaded from DB
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Receipt modal state (for last created collection)
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  // Filters: weight range (grams) and date
  const [filterMinG, setFilterMinG] = useState("");
  const [filterMaxG, setFilterMaxG] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  // Search term for Recent Collections
  const [searchTerm, setSearchTerm] = useState("");
  // Applied filters (take effect only after clicking Apply)
  const [appliedMinG, setAppliedMinG] = useState("");
  const [appliedMaxG, setAppliedMaxG] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  // Today string for date inputs (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  // Transport Requests search term (for suggestions only)
  const [reqSearchTerm, setReqSearchTerm] = useState("");
  // Collector Locations search term (for suggestions only)
  const [locSearchTerm, setLocSearchTerm] = useState("");

  // Shared Active Bin Locations (from Transport -> Bin Locations)
  const [binLocations, setBinLocations] = useState([]);
  const [binsLoading, setBinsLoading] = useState(false);
  const [binsError, setBinsError] = useState("");
  const [selectedLocManager, setSelectedLocManager] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const loadActiveBins = async () => {
    try {
      setBinsLoading(true);
      setBinsError("");
      const res = await axios.get("http://localhost:5000/api/transport/bin-routes", { params: { status: "Active" } });
      const payload = res?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setBinLocations(list);
    } catch (e) {
      setBinsError("Failed to load locations");
    } finally {
      setBinsLoading(false);
    }
  };

  // Validate date range: if both provided, To must be >= From
  const isDateRangeValid = useMemo(() => {
    try {
      if (!filterFrom || !filterTo) return true; // allow partial selection
      const from = new Date(filterFrom);
      const to = new Date(filterTo);
      return to >= from;
    } catch {
      return false;
    }
  }, [filterFrom, filterTo]);

  // Export 'Daily Collection in Current Month' to PDF
  const exportDailyCurrentMonthToPdf = async () => {
    try {
      console.log('[PDF] exportDailyCurrentMonthToPdf clicked');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const logo = await loadHeaderLogo();
      
      const title = `Daily Collection in ${new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })}`;
      const rows = chartDailyCurrentMonth || [];
      
      // Add standard header
      let yPos = addStandardPdfHeader(doc, title, `Generated on ${new Date().toLocaleString()}`, logo);
      
      // Prepare table data
      const tableColumn = ['Day', 'Total Weight (kg)'];
      const tableRows = rows.map(r => [
        r.day,
        Number(r.qty).toFixed(3)
      ]);
      
      // Compute full-width table layout
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 10;
      const rightMargin = 10;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      const dateColWidth = usableWidth * 0.6;   // 60% for date
      const qtyColWidth = usableWidth * 0.4;    // 40% for quantity

      // Add table to PDF spanning full width
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows.length ? tableRows : [['No data available']],
        startY: yPos,
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: { 
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: 'bold',
          cellPadding: 5
        },
        alternateRowStyles: { 
          fillColor: [249, 250, 251],
          cellPadding: 4
        },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: usableWidth,
        columnStyles: {
          0: { cellWidth: dateColWidth },
          1: { cellWidth: qtyColWidth, halign: 'right' }
        }
      });
      
      // Save the PDF
      doc.save(`daily_collection_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Export daily current month PDF failed', e);
    }
  };

  useEffect(() => { loadActiveBins(); }, []);

  // Keep manager name in sync if locations refresh while one is selected
  useEffect(() => {
    try {
      const val = selectedLocation || "";
      if (!val) { setSelectedLocManager(""); return; }
      const found = binLocations.find(l => (l.location || l.name || "") === val);
      setSelectedLocManager(found ? (found.managerName || found.manager || "") : "");
    } catch {}
  }, [binLocations, selectedLocation]);

  // Keep the select's ref value in sync with selectedLocation
  useEffect(() => {
    try {
      if (locationRef.current) locationRef.current.value = selectedLocation || "";
    } catch {}
  }, [selectedLocation]);

  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      const res = await axios.get("http://localhost:5000/api/collections", {
        params: {
          limit: 100,
          dateFrom: appliedFrom || undefined,
          dateTo: appliedTo || undefined,
        },
      });
      setCollections(res?.data?.collections || []);
    } catch (e) {
      // keep empty
    } finally {
      setLoadingCollections(false);
    }
  };

  // Build the currently displayed rows according to APPLIED filters used in the table
  const getFilteredRows = () => {
    try {
      return collections
        .slice()
        .filter(c => {
          const g = (Number(c.quantity)||0) * 1000;
          const minOk = appliedMinG === "" ? true : g >= Number(appliedMinG);
          const maxOk = appliedMaxG === "" ? true : g <= Number(appliedMaxG);
          return minOk && maxOk;
        })
        .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  };

  // Export the filtered table to a printable page (user can Save as PDF)
  const exportFilteredToPdf = async () => {
    try {
      console.log('[PDF] exportFilteredToPdf clicked');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const logo = await loadHeaderLogo();
      const title = 'Recent Collections Report';
      const rows = getFilteredRows();
      let subtitle = `Generated on ${new Date().toLocaleString()}\n`;
      subtitle += `Filters: MinG=${filterMinG||'-'} | MaxG=${filterMaxG||'-'} | From=${filterFrom||'-'} | To=${filterTo||'-'}`;

      // Header
      const startY = addStandardPdfHeader(doc, title, subtitle, logo);

      // Table
      const head = [['ID','User Name','Collector Name','Weight (g)','Location','Awarded Points','Collected Stamp (Time & Date)']];
      const body = rows.map((c, idx) => [
        c.collectionId || (c._id?.slice(-6) || String(idx+1)),
        c.awardedToUserId?.name || '-',
        c.collectorName || '-',
        (((Number(c.quantity)||0) * 1000).toFixed(1)),
        c.location || '-',
        String(c.awardedPoints || 0),
        c.createdAt ? new Date(c.createdAt).toLocaleString() : ''
      ]);

      // Full-width layout for landscape
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 10;
      const rightMargin = 10;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      // Proportional widths across 7 columns
      const widths = [0.1, 0.16, 0.16, 0.1, 0.18, 0.1, 0.2].map(p => +(usableWidth * p).toFixed(2));

      autoTable(doc, {
        head,
        body: body.length ? body : [['No data']],
        startY,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [241,245,249], textColor: [30,41,59], fontStyle: 'bold' },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: usableWidth,
        columnStyles: {
          0: { cellWidth: widths[0] },               // ID
          1: { cellWidth: widths[1] },               // User Name
          2: { cellWidth: widths[2] },               // Collector Name
          3: { cellWidth: widths[3], halign: 'right' }, // Weight (g)
          4: { cellWidth: widths[4] },               // Location
          5: { cellWidth: widths[5], halign: 'right' }, // Points
          6: { cellWidth: widths[6] }                // Timestamp
        }
      });

      doc.save(`collections_filtered_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Export filtered PDF failed', e);
    }
  };

  const fetchTransportRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transport-requests");
      const arr = res?.data?.requests || [];
      setTransportReqs(arr);
    } catch (e) {
      // silent
    }
  };

  // Initial load only; filtering happens on Apply
  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchTransportRequests();
  }, []);

  // Removed local edit/delete helpers; using DB-backed table and disabled buttons for now

  const totals = useMemo(() => {
    const totalQty = collections.reduce((s, c) => s + (c.quantity || 0), 0);
    const pending = collections.filter(c => (c.status||'').toLowerCase().includes('pending')).reduce((s,c)=>s+(c.quantity||0),0);
    const delivered = collections.filter(c => (c.status||'').toLowerCase().includes('delivered')).reduce((s,c)=>s+(c.quantity||0),0);
    return { totalQty, pending, delivered };
  }, [collections]);

  // Export Collector Locations (active bins) to PDF
  const exportLocationsToPdf = async () => {
    try {
      console.log('[PDF] exportLocationsToPdf clicked');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const logo = await loadHeaderLogo();
      const title = 'Collector Locations (Active)';
      const startY = addStandardPdfHeader(doc, title, `Exported: ${new Date().toLocaleString()}`, logo);

      const rows = (binLocations || []).map((loc, idx) => {
        const id = loc.routeId || loc.id || `LOC-${idx+1}`;
        const name = loc.location || loc.name || '-';
        const city = loc.city || '';
        const manager = loc.managerName || loc.manager || '';
        const distance = typeof loc.distanceKm === 'number' ? `${loc.distanceKm} km` : (loc.distance?.total ? `${loc.distance.total} ${loc.distance.unit||'km'}` : '');
        return [id, name, city, manager, distance];
      });

      autoTable(doc, {
        head: [['ID','Location','City','Manager','Distance']],
        body: rows.length ? rows : [['No locations']],
        startY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [241,245,249], textColor: [30,41,59], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 50 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 }, 4: { cellWidth: 'auto' } }
      });

      doc.save(`collector_locations_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Export locations PDF failed', e);
    }
  };

  // Today's transport requests count
  const todaysRequestsCount = useMemo(() => {
    try {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      return (transportReqs || []).reduce((sum, r) => {
        const d = r.createdAt ? new Date(r.createdAt) : null;
        return (d && d >= start && d <= end) ? sum + 1 : sum;
      }, 0);
    } catch {
      return 0;
    }
  }, [transportReqs]);

  // Today's total bottle weight (kg)
  const todaysTotalKg = useMemo(() => {
    try {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      return collections.reduce((sum, c) => {
        const d = c.createdAt ? new Date(c.createdAt) : null;
        if (d && d >= start && d <= end) return sum + (c.quantity || 0);
        return sum;
      }, 0);
    } catch {
      return 0;
    }
  }, [collections]);

  // Compute total quantity since the last transport request (any status)
  const lastRequestAt = useMemo(() => {
    if (!transportReqs || transportReqs.length === 0) return null;
    const dt = transportReqs.reduce((max, r) => {
      const d = r.createdAt ? new Date(r.createdAt) : null;
      return (!max || (d && d > max)) ? d : max;
    }, null);
    return dt;
  }, [transportReqs]);

  const qtySinceLastRequest = useMemo(() => {
    return collections.reduce((sum, c) => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      const isNew = lastRequestAt ? (d && d > lastRequestAt) : true;
      return sum + (isNew ? (c.quantity || 0) : 0);
    }, 0);
  }, [collections, lastRequestAt]);

  const currentBatchCollections = useMemo(() => {
    // Only items created after the last request belong to the current batch
    return collections.filter(c => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      return lastRequestAt ? (d && d > lastRequestAt) : true;
    });
  }, [collections, lastRequestAt]);

  const batchByType = useMemo(() => {
    const map = currentBatchCollections.reduce((acc, c) => {
      const t = c.bottleType || 'Unknown';
      acc[t] = (acc[t] || 0) + (c.quantity || 0);
      return acc;
    }, {});
    return Object.entries(map).map(([type, qty]) => ({ type, qty }));
  }, [currentBatchCollections]);

  const batchId = useMemo(() => {
    // Batch number = number of requests so far + 1 for open batch
    const num = (transportReqs?.length || 0) + 1;
    const pad4 = (n) => String(n).padStart(4, '0');
    return `CST${pad4(num)}`;
  }, [transportReqs]);

  const batchCreatedRange = useMemo(() => {
    if (!currentBatchCollections.length) return null;
    const times = currentBatchCollections
      .map(c => c.createdAt ? new Date(c.createdAt) : null)
      .filter(Boolean)
      .sort((a,b) => a - b);
    return { from: times[0], to: times[times.length - 1] };
  }, [currentBatchCollections]);

  const requestsCount = useMemo(() => transportReqs.length, [transportReqs]);

  // Charts data
  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]; // blue/purple/green/orange/red

  // Points calculation based on bottle type
  const calcPoints = (_type, qty) => {
    // qty is in kilograms; rule: 1 point per 100 grams (rounded to nearest 100g)
    const grams = (Number(qty) || 0) * 1000;
    return Math.round(grams / 100);
  };

  const chartByType = useMemo(() => {
    const map = collections.reduce((acc, s) => {
      acc[s.bottleType] = (acc[s.bottleType] || 0) + (s.quantity||0);
      return acc;
    }, {});
    return Object.entries(map).map(([type, qty]) => ({ type, qty }));
  }, [collections]);

  // Bar chart data: total weight by location (kg)
  const chartByLocation = useMemo(() => {
    const map = collections.reduce((acc, s) => {
      const loc = s.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + (s.quantity || 0);
      return acc;
    }, {});
    // Sort by qty desc for nicer display
    return Object.entries(map)
      .map(([location, qty]) => ({ location, qty }))
      .sort((a,b) => b.qty - a.qty);
  }, [collections]);

  // Export 'Collections by Location' to PDF (printable window)
  const exportCollectionsByLocationToPdf = async () => {
    try {
      console.log('[PDF] exportCollectionsByLocationToPdf clicked');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const logo = await loadHeaderLogo();
      const title = 'Collections by Location';
      const rows = chartByLocation || [];
      const startY = addStandardPdfHeader(doc, title, `Generated on ${new Date().toLocaleString()}`, logo);

      const body = rows.map(r => [r.location, Number(r.qty).toFixed(3)]);
      autoTable(doc, {
        head: [['Location','Total Weight (kg)']],
        body: body.length ? body : [['No data available']],
        startY,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [241,245,249], textColor: [30,41,59], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto', halign: 'right' } }
      });

      doc.save(`collections_by_location_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Export by location PDF failed', e);
    }
  };

  const chartStatus = useMemo(() => {
    const map = collections.reduce((acc, s) => {
      const key = s.status || 'Unknown';
      acc[key] = (acc[key] || 0) + (s.quantity||0);
      return acc;
    }, {});
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [collections]);

  const chartDaily = useMemo(() => {
    const fmt = (d) => new Date(d).toISOString().split("T")[0];
    const map = collections.reduce((acc, s) => {
      const day = fmt(s.createdAt);
      acc[day] = (acc[day] || 0) + (s.quantity||0);
      return acc;
    }, {});
    return Object.entries(map)
      .sort((a,b) => new Date(a[0]) - new Date(b[0]))
      .map(([day, qty]) => ({ day, qty }));
  }, [collections]);

  // Current month's daily collection totals (kg), includes days with zero
  const chartDailyCurrentMonth = useMemo(() => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-based
      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month
      // aggregate within this month
      const map = collections.reduce((acc, s) => {
        const d = s.createdAt ? new Date(s.createdAt) : null;
        if (!d || d < start || d > end) return acc;
        const key = d.toISOString().split('T')[0];
        acc[key] = (acc[key] || 0) + (s.quantity || 0);
        return acc;
      }, {});
      // produce all days
      const days = [];
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const key = dt.toISOString().split('T')[0];
        days.push({ day: key, qty: Number(map[key] || 0) });
      }
      return days;
    } catch {
      return [];
    }
  }, [collections]);

  // Submit new collection: award points + create collection + add to collector stock
  const handleSubmitCollection = async (form) => {
    try {
      setSubmitting(true);
      setToast("");
      const qtyG = Number(form.quantity || 0);
      const qty = qtyG / 1000; // store kg
      if (!editingId && (!form.phone || !qty)) {
        setToast("Phone number and quantity are required");
        return;
      }

      // EDIT: update existing collection
      if (editingId) {
        const pointsToAward = calcPoints('MIXED', qty);
        await axios.put(`http://localhost:5000/api/collections/${editingId}`, {
          quantity: qty,
          location: form.location || selectedLocation || "",
          collectorName: selectedLocManager || "",
          awardedPoints: pointsToAward,
          refreshTimestamp: true,
        });
        setToast('Collection updated');
        await fetchCollections();
        // reset edit state and inputs
        setEditingId(null);
        if (qtyRef.current) qtyRef.current.value = "";
        if (locationRef.current) locationRef.current.value = "";
        return;
      }

      // CREATE: verify user exists
      try {
        const existsRes = await axios.get("http://localhost:5000/api/users/exists", { params: { phone: form.phone } });
        if (!existsRes?.data?.exists) {
          setToast("User not found for this phone. Please create an account first.");
          return;
        }
      } catch (e) {
        setToast("Could not verify user. Please try again.");
        return;
      }

      const pointsToAward = calcPoints('MIXED', qty);
      // Create collection with manager name as collectorName
      const createRes = await axios.post("http://localhost:5000/api/collections", {
        collectorName: selectedLocManager || "",
        bottleType: 'MIXED',
        quantity: qty,
        location: form.location || selectedLocation || "",
        awardedPoints: pointsToAward,
      });

      const created = createRes?.data?.collection || createRes?.data || null;
      const createdId = created?.collectionId || created?._id;
      const createdAt = created?.createdAt || nowIso();

      // Award points
      try {
        await axios.post("http://localhost:5000/api/points/award", {
          phone: form.phone,
          points: pointsToAward,
          reason: 'Bottle collection (Mixed)',
          collectionId: created?.collectionId,
          collectionMongoId: created?._id,
        });
      } catch {}

      setLastReceipt({
        id: createdId,
        createdAt,
        collectorName: selectedLocManager || "",
        bottleType: 'MIXED',
        quantity: qtyG,
        location: form.location || selectedLocation || "",
        awardedPoints: pointsToAward,
        userPhone: form.phone,
      });
      setToast('Collection saved and points awarded');
      await fetchCollections();
      // Reset inputs (keep selected location if you prefer, but we clear here)
      if (phoneRef.current) phoneRef.current.value = "";
      if (qtyRef.current) qtyRef.current.value = "";
      if (locationRef.current) locationRef.current.value = "";
    } catch (e) {
      setToast("Failed to save collection. Please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(()=>setToast(""), 3000);
    }
  };

  // Start editing: populate form with row values (phone not stored with collection, keep it blank)
  const startEdit = (c) => {
    setEditingId(c._id);
    try {
      // stored in kg; show grams with 1 decimal in the input
      const grams = ((Number(c.quantity) || 0) * 1000).toFixed(1);
      if (qtyRef.current) qtyRef.current.value = grams;
      const loc = c.location || "";
      if (locationRef.current) locationRef.current.value = loc;
      setSelectedLocation(loc);
      setSelectedLocManager(c.collectorName || "");
      // focus qty field for quick edit
      if (qtyRef.current) qtyRef.current.focus();
    } catch {}
    setToast(`Editing collection #${c._id.slice(-6)}`);
    setTimeout(()=>setToast(""), 2000);
    // Scroll to the form for convenience
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  };

  const cancelEdit = () => {
    setEditingId(null);
    if (qtyRef.current) qtyRef.current.value = "";
    if (locationRef.current) locationRef.current.value = "";
  };

  const deleteRow = async (c) => {
    const ok = window.confirm("Delete this collection from database?");
    if (!ok) return;
    await axios.delete(`http://localhost:5000/api/collections/${c._id}`);
    if (editingId === c._id) cancelEdit();
    await fetchCollections();
    setToast("Collection deleted.");
    setTimeout(()=>setToast(""), 2000);
  };

  // Create transport request from selected stock row
  const requestTransport = async (stock) => {
    try {
      await axios.post("http://localhost:5000/api/transport-requests", {
        collectionId: null,
        collectorName: selectedLocManager || "",
        bottleType: stock.bottleType,
        quantity: stock.quantity,
        location: selectedLocation || stock.location || "",
        notes: `Requested via dashboard for ${stock.bottleType}`,
      });
      // Optionally push a lightweight local notification entry
      setNotifications(prev => ([
        { id: `n_${Date.now()}`, type: "request", text: `Transport requested for ${stock.quantity} ${stock.bottleType}`, time: nowIso(), read: false },
        ...prev,
      ]));
      setToast("Transport request sent to Transport team.");
      setTimeout(() => setToast(""), 2500);
      // refresh requests list
      fetchTransportRequests();
    } catch (e) {
      setToast("Failed to send transport request. Ensure backend is running.");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const Sidebar = () => (
    <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Squares2X2Icon className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Collector Hub</h2>
            <p className="text-sm text-gray-500">Bottle Collections</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab==='dashboard' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Squares2X2Icon className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab==='add' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Add Collection</span>
        </button>
        <button onClick={() => setActiveTab("stock")} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab==='stock' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
          <CubeIcon className="w-5 h-5" />
          <span className="font-medium">My Stock</span>
        </button>
        <button onClick={() => setActiveTab("requests")} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab==='requests' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
          <TruckIcon className="w-5 h-5" />
          <span className="font-medium">Transport Requests</span>
        </button>
        <button onClick={() => setActiveTab("locations")} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab==='locations' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
          <MapPinIcon className="w-5 h-5" />
          <span className="font-medium">Collector Locations</span>
        </button>
        {/* Profile tab removed */}
        <LogoutButton />
      </nav>
    </aside>
  );

  const Header = () => (
    <header className="bg-white border-b border-gray-200 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
          <p className="text-gray-600 mt-1">Record bottles, award points, and manage transport</p>
        </div>
      </div>
    </header>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
          <p className="text-emerald-100 text-sm">Total Bottle Weight (kg)</p>
          <h2 className="text-3xl font-bold">{Number(totals.totalQty).toFixed(3)}</h2>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6">
          <p className="text-blue-100 text-sm">Today's Total Bottle Weight (kg)</p>
          <h2 className="text-3xl font-bold">{Number(todaysTotalKg).toFixed(3)}</h2>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6">
          <p className="text-orange-100 text-sm">Total Transport Requests</p>
          <h2 className="text-3xl font-bold">{requestsCount}</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl p-6">
          <p className="text-purple-100 text-sm">Today's Total Transport Requests</p>
          <h2 className="text-3xl font-bold">{todaysRequestsCount}</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 -mx-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Collections by Location</h2>
        <ResponsiveContainer width="100%" height={520}>
          <BarChart data={chartByLocation} margin={{ top: 12, right: 20, bottom: 36, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="location" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} interval={0} angle={-35} textAnchor="end" height={110} tickMargin={14} allowDataOverflow/>
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} formatter={(v)=>[Number(v).toFixed(3)+' kg','Weight']} />
            <Bar dataKey="qty" name="Weight (kg)" radius={[4,4,0,0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Export by Location PDF button */}
      <div className="mt-4 flex justify-center -mx-6">
        <button
          onClick={exportCollectionsByLocationToPdf}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-sm"
        >Export PDF</button>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 -mx-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Daily Collection in {new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartDailyCurrentMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} angle={-25} textAnchor="end" interval={0} height={70} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} formatter={(v)=>[Number(v).toFixed(3)+' kg','Weight']} />
            <Bar dataKey="qty" name="Weight (kg)" radius={[4,4,0,0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Export Daily Current Month PDF button */}
      <div className="mt-4 flex justify-center -mx-6">
        <button
          onClick={exportDailyCurrentMonthToPdf}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-sm"
        >Export PDF</button>
      </div>
    </div>
  );

  const CollectorLocationsTab = () => {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Collector Locations</h2>
          <div className="flex items-center gap-2">
            <button onClick={exportLocationsToPdf} className="text-sm px-3 py-1.5 rounded-lg bg-gray-600 text-white hover:bg-gray-700">Export PDF</button>
            <button onClick={loadActiveBins} className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50">Refresh</button>
          </div>
        </div>
        {/* Search field with suggestions (does NOT filter the cards) */}
        <div className="mb-4">
          <div className="flex items-end gap-2 w-full">
            <div className="w-full relative">
              <label className="block text-sm font-medium text-gray-700">Search Locations</label>
              <input
                type="text"
                value={locSearchTerm}
                onChange={(e)=>setLocSearchTerm(e.target.value)}
                placeholder="Start typing (ID, Location, City, Manager)"
                className="border rounded-lg px-3 py-2 w-full"
              />
              {(() => {
                const term = (locSearchTerm || '').trim();
                if (!term) return null;
                const lower = term.toLowerCase();
                const starts = (v) => String(v||'').trim().toLowerCase().startsWith(lower);
                const items = (binLocations || [])
                  .slice()
                  .filter(loc => {
                    const id = loc.routeId || loc.id || '';
                    const name = loc.location || loc.name || '';
                    const city = loc.city || '';
                    const manager = loc.managerName || loc.manager || '';
                    return starts(id) || starts(name) || starts(city) || starts(manager);
                  })
                  .slice(0, 8);
                const highlight = (value) => {
                  const str = String(value||'');
                  if (!str.toLowerCase().startsWith(lower)) return str;
                  return (
                    <>
                      <mark className="bg-yellow-200">{str.slice(0, term.length)}</mark>
                      {str.slice(term.length)}
                    </>
                  );
                };
                return (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-64 overflow-auto">
                    {items.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    ) : (
                      items.map((loc, idx) => {
                        const id = loc.routeId || loc.id || '';
                        const name = loc.location || loc.name || '';
                        const city = loc.city || '';
                        const manager = loc.managerName || loc.manager || '';
                        return (
                          <div key={id || idx} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-default">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-gray-800">{highlight(id)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(name)}</span>
                              {city && (<><span className="text-gray-400">•</span><span className="text-gray-700">{highlight(city)}</span></>)}
                              {manager && (<><span className="text-gray-400">•</span><span className="text-gray-700">{highlight(manager)}</span></>)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        {binsError && <div className="mb-3 text-sm text-red-600">{binsError}</div>}
        {binsLoading ? (
          <div className="text-gray-600">Loading active locations...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {binLocations.map((loc, idx) => {
              const id = loc.routeId || loc.id || `LOC-${idx+1}`;
              const name = loc.location || loc.name || "-";
              const city = loc.city || "";
              const manager = loc.managerName || loc.manager || "";
              const distance = typeof loc.distanceKm === 'number' ? `${loc.distanceKm} km` : (loc.distance?.total ? `${loc.distance.total} ${loc.distance.unit||'km'}` : "");

              return (
                <div key={id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">ID: <span className="font-mono">{id}</span></div>
                      {city && <div className="mt-1 text-sm text-gray-700">City: {city}</div>}
                      {manager && <div className="mt-1 text-sm text-gray-700">Manager: {manager}</div>}
                      {distance && <div className="mt-1 text-sm text-gray-700">Distance: {distance}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            {binLocations.length === 0 && (
              <div className="col-span-full text-gray-500">No active locations</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Export current Transport Requests table to printable page (Save as PDF)
  const exportTransportRequestsToPdf = async () => {
    try {
      console.log('[PDF] exportTransportRequestsToPdf clicked');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const logo = await loadHeaderLogo();
      const title = 'Collector - Transport Requests';
      const startY = addStandardPdfHeader(doc, title, `Generated on ${new Date().toLocaleString()}`, logo);

      const body = (transportReqs || []).slice().map((r, idx) => [
        r.requestId || (r._id?.slice(-6) || String(idx+1)),
        r.collectorName || '-',
        (r.quantity != null) ? Number(r.quantity).toFixed(3) : '-',
        r.location || '-',
        r.status || '-',
        r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'
      ]);

      // Full-width layout for landscape
      const pageWidth = doc.internal.pageSize.getWidth();
      const leftMargin = 10;
      const rightMargin = 10;
      const usableWidth = pageWidth - leftMargin - rightMargin;
      // Proportional widths across 6 columns: ID, Collector, Weight, Location, Status, Timestamp
      const widths = [0.16, 0.18, 0.12, 0.2, 0.12, 0.22].map(p => +(usableWidth * p).toFixed(2));

      autoTable(doc, {
        head: [['Request ID','Collector','Weight (kg)','Location','Status','Created Timestamp']],
        body: body.length ? body : [['No requests']],
        startY,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [241,245,249], textColor: [30,41,59], fontStyle: 'bold' },
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: usableWidth,
        columnStyles: {
          0: { cellWidth: widths[0] },                   // Request ID
          1: { cellWidth: widths[1] },                   // Collector
          2: { cellWidth: widths[2], halign: 'right' },  // Weight (kg)
          3: { cellWidth: widths[3] },                   // Location
          4: { cellWidth: widths[4] },                   // Status
          5: { cellWidth: widths[5] }                    // Created Timestamp
        }
      });

      doc.save(`transport_requests_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('Export PDF failed', e);
    }
  };

  // Helpers to build QR code image URLs without extra dependencies
  const buildQrUrl = (payload) => {
    try {
      const text = encodeURIComponent(JSON.stringify(payload));
      // Primary provider
      return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${text}`;
    } catch {
      return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(String(payload))}`;
    }
  };
  const buildQrFallbackUrl = (payload) => {
    try {
      const text = encodeURIComponent(JSON.stringify(payload));
      // Fallback provider
      return `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${text}`;
    } catch {
      return `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(String(payload))}`;
    }
  };

  // Download a PDF receipt (no QR) with the same standard header as reports
  const downloadReceiptPdf = async () => {
    try {
      if (!lastReceipt) return;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const logo = await loadHeaderLogo();
      const title = 'Collection Receipt';
      const subtitle = `Receipt ID: ${lastReceipt.id}  |  Generated: ${new Date().toLocaleString()}`;
      let y = addStandardPdfHeader(doc, title, subtitle, logo);

      // Key-value details
      const leftX = 20;
      const labelW = 45;
      const lineH = 8;
      const rows = [
        ['Timestamp', new Date(lastReceipt.createdAt).toLocaleString()],
        ['Collector', lastReceipt.collectorName],
        ['User Phone', lastReceipt.userPhone],
        ['Weight (g)', lastReceipt.quantity],
        ['Location', lastReceipt.location || '-'],
        ['Awarded Points', lastReceipt.awardedPoints],
      ];
      rows.forEach(([label, value], i) => {
        const yPos = y + i * lineH;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.text(String(label), leftX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(17, 24, 39);
        doc.text(String(value ?? '-'), leftX + labelW, yPos);
      });

      const fileId = lastReceipt.id || 'collection_receipt';
      doc.save(`receipt_${fileId}.pdf`);
    } catch (e) {
      console.error('Failed to download receipt PDF', e);
    }
  };

  const ReceiptModal = () => {
    if (!showReceipt || !lastReceipt) return null;
    // Legacy print/QR is removed per requirement; using jsPDF download instead.
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        {/* Print styles to ensure only the receipt prints on one page */}
        <style>{`
          @page { size: A4; margin: 0; }
          @media print {
            body * { visibility: hidden; }
            .receipt-print, .receipt-print * { visibility: visible; }
            .receipt-print { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; padding: 12mm; box-sizing: border-box; }
          }
        `}</style>
        <div className="bg-white w-[680px] max-w-[95vw] rounded-2xl shadow-xl overflow-hidden receipt-print">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Collection Receipt</h3>
            <button onClick={()=>setShowReceipt(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Receipt ID</span><span className="font-mono">{lastReceipt.id}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Timestamp</span><span>{new Date(lastReceipt.createdAt).toISOString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Collector</span><span>{lastReceipt.collectorName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">User Phone</span><span>{lastReceipt.userPhone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Weight (g)</span><span>{lastReceipt.quantity}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span>{lastReceipt.location || '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Awarded Points</span><span>{lastReceipt.awardedPoints}</span></div>
            </div>
          </div>
          <div className="px-6 pb-6 flex justify-end gap-3">
            <button onClick={downloadReceiptPdf} className="border px-4 py-2 rounded-lg">Download PDF</button>
            <button onClick={()=>setShowReceipt(false)} className="bg-gray-900 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    );
  };

  const AddCollectionTab = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-5xl">
      <ReceiptModal />
      {toast && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">{toast}</div>}
      {qtySinceLastRequest >= 20 && (
        <div className="mb-3 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
          Stock is full (≥ 20 kg). Please request transport.
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-2">Record New Collection</h2>
      {editingId && (
        <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-sm">
          You are editing an existing collection. Update fields below and click "Update Collection" or click "Cancel Edit" to discard changes.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={(e)=>e.preventDefault()} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location first */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Location</label>
            <button type="button" onClick={loadActiveBins} className="text-xs text-blue-600 hover:underline disabled:text-gray-400" disabled={binsLoading}>{binsLoading ? 'Refreshing...' : 'Refresh locations'}</button>
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
            <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
            <select
              ref={locationRef}
              className="w-full outline-none bg-transparent"
              value={selectedLocation}
              onChange={(e)=>{
                const val = e.target.value || "";
                setSelectedLocation(val);
                const found = val ? binLocations.find(l => (l.location || l.name || "") === val) : null;
                setSelectedLocManager(found ? (found.managerName || found.manager || "") : "");
              }}
            >
              <option value="">Select a location</option>
              {binLocations.map((loc, idx) => {
                const name = loc.location || loc.name || '';
                const city = loc.city || '';
                // Use a proper bullet separator to avoid mojibake like 'Â·'
                const label = city ? `${name} • ${city}` : name;
                return (
                  <option key={(loc.routeId||loc.id||idx)+name} value={name}>{label}</option>
                );
              })}
            </select>
          </div>
          {selectedLocManager && (
            <div className="text-xs text-gray-700 mt-1">Collector Manager: <span className="font-medium">{selectedLocManager}</span></div>
          )}
          {binsError && <div className="text-xs text-red-600 mt-1">{binsError}</div>}
        </div>
        {/* Collector Manager second */}
        <div>
          <label className="block text-sm font-medium">Collector Manager</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50">
            <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              className="w-full outline-none bg-transparent"
              value={selectedLocManager}
              readOnly
              placeholder="Auto-filled based on location"
            />
          </div>
        </div>
        {/* Phone third */}
        <div>
          <label className="block text-sm font-medium">User Phone Number</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
            <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              ref={phoneRef}
              className="w-full outline-none"
              placeholder={editingId ? "Phone not required when editing" : "e.g., 071 123 4567"}
              defaultValue=""
              inputMode="numeric"
              maxLength={10}
              pattern="\\d{10}"
              title="Enter 10 digits"
              onInput={(e)=>{
                try {
                  let v = e.target.value || "";
                  v = v.replace(/\D/g, "").slice(0, 10);
                  e.target.value = v;
                } catch {}
              }}
              onPaste={(e)=>{
                try {
                  e.preventDefault();
                  const text = (e.clipboardData || window.clipboardData).getData('text') || "";
                  const sanitized = text.replace(/\D/g, "").slice(0, 10);
                  const input = e.currentTarget;
                  input.value = sanitized;
                } catch {}
              }}
              disabled={!!editingId}
            />
          </div>
        </div>
        {/* Weight fourth */}
        <div>
          <label className="block text-sm font-medium">Weight (g)</label>
          <input
            ref={qtyRef}
            type="text"
            inputMode="numeric"
            className="w-full border rounded-lg px-3 py-2 mt-1"
            defaultValue=""
            placeholder="e.g., 350"
            onInput={(e)=>{
              try {
                let v = e.target.value || '';
                // allow digits only (no decimals)
                v = v.replace(/\D/g, '');
                e.target.value = v;
              } catch {}
            }}
            onPaste={(e)=>{
              try {
                const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                if (/\D/.test(text)) e.preventDefault();
              } catch {}
            }}
          />
        </div>
      <div className="flex items-center gap-3 mt-6 md:col-span-2">
        <button
          type="button"
          disabled={submitting}
          onClick={()=>handleSubmitCollection({
            phone: phoneRef.current?.value?.trim() || "",
            quantity: qtyRef.current?.value || "",
            location: selectedLocation || "",
          })}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 disabled:opacity-60"
        >
          {editingId ? 'Update Collection' : 'Save & Award Points'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel Edit
          </button>
        )}
        <button type="button" onClick={() => {
          if (!lastReceipt) { setToast("Please save the collection first to generate a receipt."); return; }
          setShowReceipt(true);
        }} className="flex items-center gap-2 border px-4 py-2 rounded-lg"><QrCodeIcon className="w-5 h-5"/>Generate Receipt</button>
      </div>
      </form>

      {/* Right-side Points Rules */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 h-max">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Points Rules</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li><span className="font-medium">Mixed:</span> 1 point per 100g</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">Points are awarded to the user who brings bottles based on the rules above.</p>
      </div>
      </div>

      {/* Recent Collections Table (under the form) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Collections</h3>
        {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Weight (g)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              min="0"
              value={filterMinG}
              onChange={(e)=>{
                try {
                  const v = (e.target.value || '').replace(/\D/g, '');
                  setFilterMinG(v);
                } catch { setFilterMinG(e.target.value); }
              }}
              onPaste={(e)=>{
                try {
                  const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                  if (/\D/.test(text)) e.preventDefault();
                } catch {}
              }}
              className="border rounded-lg px-3 py-2 w-40"
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Weight (g)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              min="0"
              value={filterMaxG}
              onChange={(e)=>{
                try {
                  const v = (e.target.value || '').replace(/\D/g, '');
                  setFilterMaxG(v);
                } catch { setFilterMaxG(e.target.value); }
              }}
              onPaste={(e)=>{
                try {
                  const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                  if (/\D/.test(text)) e.preventDefault();
                } catch {}
              }}
              className="border rounded-lg px-3 py-2 w-40"
              placeholder="e.g., 1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e)=>setFilterFrom(e.target.value)}
              max={todayStr}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e)=>setFilterTo(e.target.value)}
              min={filterFrom || undefined}
              max={todayStr}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={()=>{ setAppliedMinG(filterMinG); setAppliedMaxG(filterMaxG); setAppliedFrom(filterFrom); setAppliedTo(filterTo); fetchCollections(); }}
              disabled={!(filterMinG !== '' && filterMaxG !== '' && Number(filterMaxG) > Number(filterMinG) && isDateRangeValid)}
              title={!(filterMinG !== '' && filterMaxG !== '' && Number(filterMaxG) > Number(filterMinG)) ? 'Set Min and Max (Max > Min) first' : (!isDateRangeValid ? 'To date must be on/after From date' : '')}
              className="mt-6 md:mt-0 bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >Apply</button>
            <button onClick={()=>{ setFilterMinG(""); setFilterMaxG(""); setFilterFrom(""); setFilterTo(""); setAppliedMinG(""); setAppliedMaxG(""); setAppliedFrom(""); setAppliedTo(""); fetchCollections(); }} className="mt-6 md:mt-0 border px-4 py-2 rounded-lg">Reset</button>
          </div>
        </div>
        {/* Search field with suggestions (does NOT filter the table) */}
        <div className="mb-4">
          <div className="flex items-end gap-2 w-full">
            <div className="w-full relative">
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                placeholder="Start typing (ID, User, Collector, Location)"
                className="border rounded-lg px-3 py-2 w-full"
              />
              {(() => {
                const term = (searchTerm || '').trim();
                if (!term) return null;
                const lower = term.toLowerCase();
                const starts = (v) => String(v||'').trim().toLowerCase().startsWith(lower);
                const items = collections
                  .slice()
                  .filter(c => {
                    const idStr = c.collectionId || (c._id?.slice(-6) || '');
                    const user = c.awardedToUserId?.name || '';
                    const collector = c.collectorName || '';
                    const location = c.location || '';
                    const kg = (Number(c.quantity)||0).toFixed(3);
                    const g = (((Number(c.quantity)||0) * 1000).toFixed(0));
                    const pts = String(c.awardedPoints || 0);
                    return starts(idStr) || starts(user) || starts(collector) || starts(location)
                      || starts(kg) || starts(g) || starts(pts);
                  })
                  .slice(0, 8);
                const highlight = (value) => {
                  const str = String(value||'');
                  if (!str.toLowerCase().startsWith(lower)) return str;
                  return (
                    <>
                      <mark className="bg-yellow-200">{str.slice(0, term.length)}</mark>
                      {str.slice(term.length)}
                    </>
                  );
                };
                return (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-64 overflow-auto">
                    {items.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                    ) : (
                      items.map((c) => {
                        const idStr = c.collectionId || (c._id?.slice(-6) || '');
                        const user = c.awardedToUserId?.name || '';
                        const collector = c.collectorName || '';
                        const location = c.location || '';
                        const kg = (Number(c.quantity)||0).toFixed(3) + ' kg';
                        const g = (((Number(c.quantity)||0) * 1000).toFixed(0)) + ' g';
                        const pts = String(c.awardedPoints || 0) + ' pts';
                        return (
                          <div key={c._id} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-default">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-gray-800">{highlight(idStr)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(user)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(collector)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(location)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(kg)}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-700">{highlight(g)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-700">{highlight(pts)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        {/* Export PDF button below input fields */}
        <div className="mb-4">
          <button onClick={exportFilteredToPdf} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-sm">Export PDF</button>
        </div>
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Collector Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Weight (g)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Awarded Points</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Collected Stamp (Time & Date)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadingCollections && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              )}
              {!loadingCollections && collections.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">No collections yet.</td>
                </tr>
              )}
              {!loadingCollections && collections
                .slice()
                .filter(c => {
                  const g = (Number(c.quantity)||0) * 1000;
                  const minOk = filterMinG === "" ? true : g >= Number(filterMinG);
                  const maxOk = filterMaxG === "" ? true : g <= Number(filterMaxG);
                  return minOk && maxOk;
                })
                .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
                .map((c, idx) => (
                <tr key={c._id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{c.collectionId || (c._id?.slice(-6) || idx + 1)}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.awardedToUserId?.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.collectorName || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{((Number(c.quantity)||0) * 1000).toFixed(0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.location || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{c.awardedPoints || 0}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(c)} className="px-3 py-1 rounded bg-blue-600 text-white">Edit</button>
                      <button onClick={()=>deleteRow(c)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MyStockTab = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">My Stock</h2>
      {qtySinceLastRequest >= 20 && (
        <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
          Stock is full (≥ 20 kg). Please request transport.
        </div>
      )}
      {currentBatchCollections.length === 0 ? (
        <div className="p-6 border rounded-2xl bg-gray-50 text-gray-700">
          No current stock. New collections will appear here until you send a request.
        </div>
      ) : (
        <div className="p-6 border rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Batch</div>
              <div className="text-2xl font-bold text-gray-900">{batchId}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Since last request</div>
              <div className="text-3xl font-extrabold text-gray-900">{Number(qtySinceLastRequest).toFixed(3)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border">
              <div className="text-sm text-gray-500">Current Weight</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{Number(qtySinceLastRequest).toFixed(3)} kg</div>
              <div className="text-xs text-gray-500 mt-1">Since last transport request</div>
            </div>
            <div className="p-4 rounded-xl bg-white border">
              <div className="text-sm text-gray-500">Created Range</div>
              <div className="mt-2 text-sm text-gray-800">
                <div>From: {batchCreatedRange?.from ? new Date(batchCreatedRange.from).toLocaleString() : '-'}</div>
                <div>To: {batchCreatedRange?.to ? new Date(batchCreatedRange.to).toLocaleString() : '-'}</div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-2"><span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending Transport</span></div>
              </div>
              <button
                className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-60"
                disabled={qtySinceLastRequest < 20}
                title="Enabled when total since last request reaches 20 kg"
                onClick={async ()=>{
                  try {
                    await axios.post('http://localhost:5000/api/transport-requests', {
                      collectionId: null,
                      collectorName: selectedLocManager || '',
                      bottleType: 'Mixed',
                      quantity: qtySinceLastRequest,
                      location: selectedLocation || '',
                      notes: 'Threshold reached (>=20 kg) since last request. Please collect.',
                      requestId: batchId,
                    });
                    setToast('Transport request sent to Transport team.');
                    setTimeout(()=>setToast(''), 2500);
                    await fetchTransportRequests();
                    await fetchCollections();
                  } catch (e) {
                    setToast('Failed to create transport request.');
                    setTimeout(()=>setToast(''), 2500);
                  }
                }}
              >Request Transport</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TransportRequestsTab = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Transport Requests</h2>
      {/* Export PDF button centered */}
      <div className="mb-4">
        <button
          onClick={exportTransportRequestsToPdf}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white shadow-sm"
        >Export PDF</button>
      </div>
      {/* Search field with suggestions (does NOT filter the table) */}
      <div className="mb-4">
        <div className="flex items-end gap-2 w-full">
          <div className="w-full relative">
            <label className="block text-sm font-medium text-gray-700">Search Requests</label>
            <input
              type="text"
              value={reqSearchTerm}
              onChange={(e)=>setReqSearchTerm(e.target.value)}
              placeholder="Start typing (Request ID, Collector, Location, Status)"
              className="border rounded-lg px-3 py-2 w-full"
            />
            {(() => {
              const term = (reqSearchTerm || '').trim();
              if (!term) return null;
              const lower = term.toLowerCase();
              const starts = (v) => String(v||'').trim().toLowerCase().startsWith(lower);
              const items = (transportReqs || [])
                .slice()
                .filter(r => {
                  const idStr = r.requestId || (r._id?.slice(-6) || '');
                  const collector = r.collectorName || '';
                  const location = r.location || '';
                  const status = r.status || '';
                  const kg = (r.quantity != null) ? String(Number(r.quantity).toFixed(3)) : '';
                  const g = (r.quantity != null) ? String(Math.round(Number(r.quantity)*1000)) : '';
                  return starts(idStr) || starts(collector) || starts(location) || starts(status)
                    || starts(kg) || starts(g);
                })
                .slice(0, 8);
              const highlight = (value) => {
                const str = String(value||'');
                if (!str.toLowerCase().startsWith(lower)) return str;
                return (
                  <>
                    <mark className="bg-yellow-200">{str.slice(0, term.length)}</mark>
                    {str.slice(term.length)}
                  </>
                );
              };
              return (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-64 overflow-auto">
                  {items.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                  ) : (
                    items.map((r, idx) => {
                      const idStr = r.requestId || (r._id?.slice(-6) || '');
                      const collector = r.collectorName || '';
                      const location = r.location || '';
                      const status = r.status || '';
                      const kg = (r.quantity != null) ? `${Number(r.quantity).toFixed(3)} kg` : '';
                      const g = (r.quantity != null) ? `${Math.round(Number(r.quantity)*1000)} g` : '';
                      return (
                        <div key={r._id || idx} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-default">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-mono text-gray-800">{highlight(idStr)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{highlight(collector)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{highlight(location)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{highlight(status)}</span>
                            {kg && (<><span className="text-gray-400">•</span><span className="text-gray-700">{highlight(kg)}</span><span className="text-gray-400">/</span><span className="text-gray-700">{highlight(g)}</span></>)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-700">
              <th className="py-3 px-4 font-semibold">Request ID</th>
              <th className="py-3 px-4 font-semibold">Collector</th>
              <th className="py-3 px-4 font-semibold">Weight (kg)</th>
              <th className="py-3 px-4 font-semibold">Location</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Created Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transportReqs.map((r, idx) => (
              <tr key={r._id || idx} className="border-t text-sm">
                <td className="py-3 px-4 font-mono">{r.requestId || (r._id?.slice(-6) || idx+1)}</td>
                <td className="py-3 px-4">{r.collectorName}</td>
                <td className="py-3 px-4 font-semibold">{(r.quantity != null) ? Number(r.quantity).toFixed(3) : '-'}</td>
                <td className="py-3 px-4">{r.location || '-'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Delivered' ? 'bg-green-100 text-green-700' : r.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : r.status === 'PickedUp' ? 'bg-purple-100 text-purple-700' : r.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                <td className="py-3 px-4">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                <td className="py-3 px-4">
                  <button
                    className="px-3 py-1 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                    disabled={r.status !== 'Assigned'}
                    onClick={async ()=>{
                      try {
                        await axios.post(`http://localhost:5000/api/transport-requests/${r._id}/status`, { status: 'PickedUp' });
                        setTransportReqs(prev => prev.map(x => x._id === r._id ? { ...x, status: 'PickedUp' } : x));
                        setToast('Marked as handed over.');
                        try { window.dispatchEvent(new CustomEvent('transport:status-updated', { detail: { id: r._id, status: 'PickedUp' } })); } catch {}
                        setTimeout(()=>setToast(''), 2000);
                      } catch (e) {
                        setToast('Failed to update status.');
                        setTimeout(()=>setToast(''), 2000);
                      }
                    }}
                  >Handed over</button>
                </td>
              </tr>
            ))}
            {transportReqs.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-gray-500" colSpan={7}>No requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-800">{n.text}</span>
              <span className="text-xs text-gray-500">{new Date(n.time).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-gray-600">No notifications</div>
        )}
      </div>
    </div>
  );

  

  const Content = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab/>;
      case "add": return <AddCollectionTab/>;
      case "stock": return <MyStockTab/>;
      case "requests": return <TransportRequestsTab/>;
      case "locations": return <CollectorLocationsTab/>;
      default: return <DashboardTab/>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar/>
      <div className="flex-1 overflow-auto">
        <Header/>
        <div className="p-6">
          <Content/>
        </div>
      </div>
    </div>
  );
}

