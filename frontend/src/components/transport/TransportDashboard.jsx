// src/components/transport/TransportDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { validateVehicleForm, mapFormToVehiclePayload } from "../../models/vehicle";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle, Plus, Search, Filter, Navigation, Users, FileText } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import LogoutButton from "../common/LogoutButton";

const collectionData = [
  { month: "Jan", collected: 1200, scheduled: 1400, efficiency: 85.7 },
  { month: "Feb", collected: 1450, scheduled: 1600, efficiency: 90.6 },
  { month: "Mar", collected: 1680, scheduled: 1800, efficiency: 93.3 },
  { month: "Apr", collected: 1920, scheduled: 2000, efficiency: 96.0 },
  { month: "May", collected: 2100, scheduled: 2200, efficiency: 95.5 },
];

const routeStatusData = [
  { name: "Completed", value: 65, count: 26 },
  { name: "In Progress", value: 20, count: 8 },
  { name: "Scheduled", value: 10, count: 4 },
  { name: "Delayed", value: 5, count: 2 },
];

const activeCollections = [
  { id: "COL001", location: "Downtown Area", driver: "John Smith", vehicle: "TRK-001", bottles: 450, status: "In Progress", startTime: "08:30", estimatedCompletion: "11:30", progress: 65 },
  { id: "COL002", location: "Industrial Zone", driver: "Sarah Johnson", vehicle: "TRK-002", bottles: 320, status: "Scheduled", startTime: "09:00", estimatedCompletion: "12:00", progress: 0 },
  { id: "COL003", location: "Residential District", driver: "Mike Wilson", vehicle: "TRK-003", bottles: 280, status: "Completed", startTime: "07:00", estimatedCompletion: "10:00", progress: 100 },
  { id: "COL004", location: "Business Park", driver: "Emma Davis", vehicle: "TRK-004", bottles: 380, status: "Delayed", startTime: "08:00", estimatedCompletion: "11:00", progress: 30 },
];

// Route data is loaded from the backend (no mock data)

const vehicles = [
  { id: "TRK-001", type: "Large Truck", capacity: 500, driver: "John Smith", status: "Active", location: "Downtown", fuel: 75, maintenance: "Good" },
  { id: "TRK-002", type: "Medium Truck", capacity: 350, driver: "Sarah Johnson", status: "Active", location: "Industrial Zone", fuel: 60, maintenance: "Good" },
  { id: "TRK-003", type: "Small Truck", capacity: 250, driver: "Mike Wilson", status: "Maintenance", location: "Depot", fuel: 90, maintenance: "Service Due" },
  { id: "TRK-004", type: "Large Truck", capacity: 500, driver: "Emma Davis", status: "Active", location: "Business Park", fuel: 45, maintenance: "Good" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TransportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  // Transport Requests (Pending list)
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [assignNotice, setAssignNotice] = useState({ type: "", text: "" }); // {type: 'success'|'error'|'', text}
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [scheduleMin, setScheduleMin] = useState("");
  // Vehicles for Assign modal (active only)
  const [vehiclesAssign, setVehiclesAssign] = useState([]);
  const [loadingVehiclesAssign, setLoadingVehiclesAssign] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  // Driver management state
  const [driversList, setDriversList] = useState([]);
  const [loadingDriversList, setLoadingDriversList] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [addDriverForm, setAddDriverForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "" },
    dateOfBirth: "",
    licenseNumber: "",
    licenseType: "Class C",
    licenseExpiry: "",
    hireDate: "",
    employmentStatus: "Active",
    shift: "Morning",
    username: "",
    password: "",
  });

  // Add Route modal state
  const [showAddRoute, setShowAddRoute] = useState(false);
  // This modal is repurposed for adding Bin Routes
  const [addBinRouteForm, setAddBinRouteForm] = useState({
    location: "",
    managerName: "",
    status: "Active",
    distanceKm: "",
  });
  const [addBinRouteErrors, setAddBinRouteErrors] = useState({});

  // DB-backed routes list
  const [routesList, setRoutesList] = useState([]);
  const [loadingRoutesList, setLoadingRoutesList] = useState(false);

  // Available Bin Routes (frontend-managed)
  const [binRoutes, setBinRoutes] = useState([]);
  const [binFilters, setBinFilters] = useState({ search: '', status: '', city: '', manager: '' });
  const [loadingBinRoutes, setLoadingBinRoutes] = useState(false);
  const [editingBinId, setEditingBinId] = useState(null);
  const [editingBinData, setEditingBinData] = useState({ location: '', city: '', managerName: '', status: 'Active', distanceKm: '' });

  const fetchBinRoutes = async () => {
    try {
      setLoadingBinRoutes(true);
      const res = await axios.get('http://localhost:5000/api/transport/bin-routes', {
        params: {
          search: binFilters.search || undefined,
          status: binFilters.status || undefined,
          city: binFilters.city || undefined,
          manager: binFilters.manager || undefined,
        }
      });
      const payload = res?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setBinRoutes(list);
    } catch (err) { console.error('Failed to load bin routes', err); }
    finally { setLoadingBinRoutes(false); }
  };

  // Reports: PDF download helpers using current dashboard state
  const downloadSummaryPdf = () => {
    const totalVehicles = vehiclesList.length;
    const vehiclesActive = vehiclesList.filter(v => v.status === 'Active').length;
    const vehiclesInactive = vehiclesList.filter(v => v.status === 'Inactive').length;
    const vehiclesMaint = vehiclesList.filter(v => v.status === 'Maintenance').length;
    const totalDrivers = driversList.length;
    const totalBinLocations = binRoutes.length;
    const pendingCount = requests.length;
    const assignedCount = assigned.filter(x => x.status === 'Assigned').length;
    const deliveredCount = assigned.filter(x => x.status === 'Delivered').length;
    const columns = ['Metric','Value'];
    const rows = [
      ['Total Bin Locations', totalBinLocations],
      ['Total Vehicles', totalVehicles],
      ['Vehicles Active', vehiclesActive],
      ['Vehicles Inactive', vehiclesInactive],
      ['Vehicles Maintenance', vehiclesMaint],
      ['Total Drivers', totalDrivers],
      ['Pending Requests', pendingCount],
      ['Assigned Deliveries', assignedCount],
      ['Delivered', deliveredCount],
    ];
    openPdfWindow('Transport Summary', columns, rows);
  };

  const downloadBinLocationsPdf = () => {
    const columns = ['Location ID', 'Location', 'City', 'Collection Manager', 'Status', 'Distance (km)'];
    const rows = binRoutes.map(r => [r.routeId || r.id || '', r.location||'', r.city||'', r.managerName||'', r.status||'', r.distanceKm??'']);
    openPdfWindow('Bin Locations', columns, rows);
  };
  const downloadVehiclesPdf = () => {
    const columns = ['Vehicle ID', 'Type', 'Status', 'License Plate', 'Fuel Level', 'Fuel Type', 'Maintenance'];
    const rows = vehiclesList.map(v => [v.vehicleId||'', v.type||'', v.status||'', v.specifications?.licensePlate||'', v.fuel?.level ?? '', v.fuel?.fuelType||'', v.maintenance?.status||'']);
    openPdfWindow('Vehicles', columns, rows);
  };
  const downloadDriversPdf = () => {
    const columns = ['Employee ID', 'First Name', 'Last Name', 'Status', 'Phone', 'Email'];
    const rows = driversList.map(d => [d.employeeId||'', d.personalInfo?.firstName||'', d.personalInfo?.lastName||'', d.currentStatus||'', d.phone||d.personalInfo?.phone||'', d.email||d.personalInfo?.email||'']);
    openPdfWindow('Drivers', columns, rows);
  };
  const downloadRequestsPdf = () => {
    const columns = ['Request ID', 'Collector', 'Bottle Type', 'Quantity', 'Location', 'Status', 'Requested At'];
    const rows = requests.map(r => [r.requestId||r._id||'', r.collectorName||'', r.bottleType||'', r.quantity??'', r.location||'', r.status||'', r.createdAt ? new Date(r.createdAt).toISOString() : '']);
    openPdfWindow('Pending Requests', columns, rows);
  };
  const downloadAssignedPdf = () => {
    const columns = ['Stock ID', 'Scheduled Time', 'Driver', 'Collector', 'Bottle Type', 'Quantity', 'Location', 'Status'];
    const rows = assigned.map(r => [r.requestId||r._id||'', r.scheduledAt ? new Date(r.scheduledAt).toISOString() : '', getDriverNameById(r.assignedDriverId), r.collectorName||'', r.bottleType||'', r.quantity??'', r.location||'', r.status||'']);
    openPdfWindow('Assigned & Delivered', columns, rows);
  };

  const renderReports = () => {
    const totalVehicles = vehiclesList.length;
    const vehiclesActive = vehiclesList.filter(v => v.status === 'Active').length;
    const vehiclesInactive = vehiclesList.filter(v => v.status === 'Inactive').length;
    const vehiclesMaint = vehiclesList.filter(v => v.status === 'Maintenance').length;
    const totalDrivers = driversList.length;
    const totalBinLocations = binRoutes.length;
    const pendingRequests = requests.length;
    const assignedCount = assigned.filter(x=>x.status==='Assigned').length;
    const deliveredCount = assigned.filter(x=>x.status==='Delivered').length;

    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Transport Summary</h2>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadSummaryPdf}>Download Summary (PDF)</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Bin Locations</div>
              <div className="text-2xl font-bold">{totalBinLocations}</div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Vehicles (Active/Inactive/Maint.)</div>
              <div className="text-2xl font-bold">{vehiclesActive} / {vehiclesInactive} / {vehiclesMaint}</div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Drivers</div>
              <div className="text-2xl font-bold">{totalDrivers}</div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Pending Requests</div>
              <div className="text-2xl font-bold">{pendingRequests}</div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Assigned Deliveries</div>
              <div className="text-2xl font-bold">{assignedCount}</div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm text-gray-500">Delivered</div>
              <div className="text-2xl font-bold">{deliveredCount}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Bin Locations</h3>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadBinLocationsPdf}>Download PDF</Button>
          </div>
          <div className="text-sm text-gray-600">Export the current list of bin locations.</div>
        </Card>

        <Card className="p-4 shadow rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Vehicles</h3>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadVehiclesPdf}>Download PDF</Button>
          </div>
          <div className="text-sm text-gray-600">Export the current vehicle fleet.</div>
        </Card>

        <Card className="p-4 shadow rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Drivers</h3>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadDriversPdf}>Download PDF</Button>
          </div>
          <div className="text-sm text-gray-600">Export transport drivers.</div>
        </Card>

        <Card className="p-4 shadow rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Pending Requests</h3>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadRequestsPdf}>Download PDF</Button>
          </div>
          <div className="text-sm text-gray-600">Export current pending collection requests.</div>
        </Card>

        <Card className="p-4 shadow rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Assigned & Delivered</h3>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={downloadAssignedPdf}>Download PDF</Button>
          </div>
          <div className="text-sm text-gray-600">Export assigned and delivered transport records.</div>
        </Card>
      </div>
    );
  };

  const fetchRoutesList = async () => {
    try {
      setLoadingRoutesList(true);
      const res = await axios.get('http://localhost:5000/api/transport/routes');
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : payload || [];
      setRoutesList(list);
    } catch (err) { console.error('Failed to fetch routes', err); }
    finally { setLoadingRoutesList(false); }
  };

  const validateAddBinRouteForm = () => {
    const errors = {};
    const loc = (addBinRouteForm.location || '').trim();
    const mgr = (addBinRouteForm.managerName || '').trim();
    const dist = Number(addBinRouteForm.distanceKm);
    const status = addBinRouteForm.status;
    if (!loc) errors.location = 'Location is required';
    if (!mgr) errors.managerName = 'Collection Manager is required';
    if (!Number.isFinite(dist) || dist <= 0) errors.distanceKm = 'Distance must be a positive number';
    if (!['Active','Inactive','Maintenance'].includes(status)) errors.status = 'Invalid status';
    setAddBinRouteErrors(errors);
    return { valid: Object.keys(errors).length === 0, errors };
  };

  // Vehicle management state
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loadingVehiclesList, setLoadingVehiclesList] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editVehicleForm, setEditVehicleForm] = useState({
    vehicleId: "",
    type: "Medium Truck",
    capacityBottles: "",
    capacityWeight: "",
    licensePlate: "",
    status: "Active",
    fuelLevel: 100,
    fuelType: "Diesel",
    maintenanceStatus: "Good",
  });
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("");
  const [addVehicleForm, setAddVehicleForm] = useState({
    vehicleId: "",
    type: "Medium Truck",
    capacityBottles: "",
    capacityWeight: "",
    model: "",
    licensePlate: "",
    color: "",
    status: "Active",
    fuelLevel: 100,
    fuelType: "Diesel",
    maintenanceStatus: "Good",
    
  });

  const menuItems = [
    { name: "Transport Overview", key: "overview", icon: <Truck size={20} /> },
    { name: "Requests", key: "requests", icon: <Package size={20} /> },
    { name: "Assigned", key: "assigned", icon: <Package size={20} /> },
    { name: "Bin Locations", key: "routes", icon: <MapPin size={20} /> },
    { name: "Vehicle Fleet", key: "vehicles", icon: <Truck size={20} /> },
    { name: "Drivers", key: "drivers", icon: <Users size={20} /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-100";
      case "In Progress": return "text-blue-600 bg-blue-100";
      case "Scheduled": return "text-yellow-600 bg-yellow-100";
      case "Delayed": return "text-red-600 bg-red-100";
      case "Active": return "text-green-600 bg-green-100";
      case "Inactive": return "text-gray-600 bg-gray-100";
      case "Maintenance": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const fetchDriversList = async () => {
    try {
      setLoadingDriversList(true);
      const res = await axios.get('http://localhost:5000/api/employees', {
        params: { department: 'transport', position: 'Driver', status: 'active' }
      });
      const payload = res?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setDriversList(list);
    } catch (err) { console.error('Failed to fetch drivers', err); }
    finally { setLoadingDriversList(false); }
  };

  // Ensure drivers are available for name lookups (Assigned tab displays names)
  useEffect(() => {
    fetchDriversList();
  }, []);

  useEffect(() => {
    if (activeTab === 'assigned') {
      fetchDriversList();
      fetchAssigned();
    }
  }, [activeTab]);

  // Ensure overview has up-to-date data for metrics
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAssigned();
      fetchVehiclesList();
      fetchBinRoutes();
      fetchDriversList();
      fetchRequests();
      // Load rejected (cancelled) count
      (async ()=>{
        try {
          const res = await axios.get('http://localhost:5000/api/transport-requests', { params: { status: 'Cancelled' } });
          const arr = res?.data?.requests || [];
          setRejectedCount(Array.isArray(arr) ? arr.length : 0);
        } catch (e) { console.error('Failed to fetch rejected count', e); setRejectedCount(0); }
      })();
    }
  }, [activeTab]);

  // Auto-refresh while viewing Assigned to reflect status updates from Inventory
  useEffect(() => {
    if (activeTab !== 'assigned') return;
    const t = setInterval(() => { fetchAssigned(); }, 10000);
    return () => clearInterval(t);
  }, [activeTab]);

  const getDriverNameById = (id) => {
    if (!id) return '-';
    const d = driversList.find(x => (x._id === id) || (String(x._id) === String(id)));
    if (!d) return id; // fallback
    const first = d.personalInfo?.firstName || '';
    const last = d.personalInfo?.lastName || '';
    const name = `${first} ${last}`.trim();
    return name || d.employeeId || id;
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get('http://localhost:5000/api/transport-requests', { params: { status: 'Pending' } });
      const arr = res?.data?.requests || [];
      setRequests(arr);
    } catch (err) { console.error('Failed to fetch requests', err); }
    finally { setLoadingRequests(false); }
  };

  // Assigned Requests
  const [assigned, setAssigned] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);
  const fetchAssigned = async () => {
    try {
      setLoadingAssigned(true);
      const [aRes, pRes, dRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transport-requests', { params: { status: 'Assigned' } }),
        axios.get('http://localhost:5000/api/transport-requests', { params: { status: 'PickedUp' } }),
        axios.get('http://localhost:5000/api/transport-requests', { params: { status: 'Delivered' } }),
      ]);
      const a = aRes?.data?.requests || [];
      const p = pRes?.data?.requests || [];
      const d = dRes?.data?.requests || [];
      // Merge so that already delivered items still show with Delivered status
      // Sort by Stock ID (requestId) ascending
      const merged = [...a, ...p, ...d].sort((x,y)=>{
        const kx = (x.requestId || x._id || '').toString();
        const ky = (y.requestId || y._id || '').toString();
        if (kx < ky) return -1; if (kx > ky) return 1; return 0;
      });
      setAssigned(merged);
    } catch (err) { console.error('Failed to fetch assigned requests', err); }
    finally { setLoadingAssigned(false); }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle size={16} className="text-green-600" />;
      case "In Progress": return <Clock size={16} className="text-blue-600" />;
      case "Scheduled": return <Clock size={16} className="text-yellow-600" />;
      case "Delayed": return <AlertCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  // Modal to select driver and schedule time
  const AssignModal = () => {
    if (!showAssignModal) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white w-[760px] max-w-[95vw] rounded-2xl shadow-xl overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assign Driver & Schedule Pickup</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={()=>{ setShowAssignModal(false); setAssignRequestId(null); setSelectedDriverId(""); setAssignNotice({type:'', text:''}); }}>✕</button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Select a Driver</h4>
              {assignNotice.text && (
                <div className={`mb-3 text-sm px-3 py-2 rounded-lg ${assignNotice.type==='error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{assignNotice.text}</div>
              )}
              {loadingDrivers ? (
                <div className="text-gray-600">Loading drivers...</div>
              ) : (
                <div className="max-h-72 overflow-auto border rounded-xl">
                  {drivers.map((d)=>{
                    const nameFromPersonal = `${d.personalInfo?.firstName || ''} ${d.personalInfo?.lastName || ''}`.trim();
                    const name = (d.fullName && String(d.fullName).trim()) || nameFromPersonal || d.employeeId;
                    const status = d.currentStatus;
                    const selected = selectedDriverId === d._id;
                    return (
                      <button key={d._id} onClick={()=>setSelectedDriverId(d._id)} className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-xs text-gray-500">Employee ID: {d.employeeId}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${status==='Available'?'bg-green-100 text-green-700': 'bg-gray-100 text-gray-700'}`}>{status}</span>
                        </div>
                      </button>
                    );
                  })}
                  {drivers.length === 0 && (
                    <div className="p-4 text-gray-600">No drivers found</div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Active Vehicles</h4>
                {loadingVehiclesAssign ? (
                  <div className="text-gray-600">Loading vehicles...</div>
                ) : (
                  <div className="max-h-48 overflow-auto border rounded-xl">
                    {vehiclesAssign.map((v)=>{
                      const vid = v.vehicleId || v._id;
                      const vtype = v.type || '-';
                      const selected = selectedVehicleId === vid;
                      return (
                        <button
                          key={v._id || vid}
                          type="button"
                          onClick={()=>setSelectedVehicleId(vid)}
                          className={`w-full text-left px-4 py-2 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}
                        >
                          <div>
                            <div className="font-medium">{vtype}</div>
                            <div className="text-xs text-gray-500">Vehicle ID: {vid}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selected && <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Selected</span>}
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                          </div>
                        </button>
                      );
                    })}
                    {vehiclesAssign.length === 0 && (
                      <div className="p-3 text-gray-600">No active vehicles found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Pickup Schedule</label>
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2 w-full"
                min={scheduleMin || undefined}
                value={scheduledAt}
                onChange={(e)=>{
                  const v = e.target.value;
                  if (scheduleMin && v && new Date(v) < new Date(scheduleMin)) {
                    setAssignNotice({ type:'error', text:'Pickup schedule must be in the future.' });
                    setScheduledAt(scheduleMin);
                  } else {
                    setAssignNotice({ type:'', text:'' });
                    setScheduledAt(v);
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Schedule when the driver should pick bottles at the collector location.</div>
            </div>
          </div>
          <div className="px-5 pb-5 flex justify-end gap-2">
            <button className="border px-4 py-2 rounded-lg" onClick={()=>{ setShowAssignModal(false); setAssignRequestId(null); setSelectedDriverId(""); setSelectedVehicleId(""); setAssignNotice({type:'', text:''}); }}>Cancel</button>
            <button disabled={assignSubmitting} className={`px-4 py-2 rounded-lg ${assignSubmitting ? 'bg-blue-300 text-white' : 'bg-blue-600 text-white'}`} onClick={async ()=>{
              try {
                setAssignNotice({ type: '', text: '' });
                if (!assignRequestId) { setAssignNotice({ type:'error', text:'Invalid request selected' }); return; }
                if (!selectedDriverId) { setAssignNotice({ type:'error', text:'Please select a driver' }); return; }
                if (!scheduledAt) { setAssignNotice({ type:'error', text:'Please choose a pickup schedule' }); return; }
                if (scheduledAt && new Date(scheduledAt) < new Date()) { setAssignNotice({ type:'error', text:'Pickup schedule must be in the future.' }); return; }
                if (!selectedVehicleId) { setAssignNotice({ type:'error', text:'Please select an active vehicle' }); return; }
                setAssignSubmitting(true);
                await axios.post(`http://localhost:5000/api/transport-requests/${assignRequestId}/assign-driver`, {
                  driverId: selectedDriverId,
                  scheduledAt,
                  vehicleId: selectedVehicleId,
                });
                setAssignNotice({ type:'success', text:'Assigned successfully' });
                // brief delay to show success
                setTimeout(()=>{
                  setShowAssignModal(false);
                  setAssignRequestId(null);
                  setSelectedDriverId("");
                  setSelectedVehicleId("");
                  setAssignSubmitting(false);
                  fetchRequests();
                }, 600);
              } catch (err) {
                console.error('Assign failed', err);
                setAssignSubmitting(false);
                setAssignNotice({ type:'error', text: err?.response?.data?.message || 'Failed to assign. Please try again.' });
              }
            }}>{assignSubmitting ? 'Assigning...' : 'Confirm'}</button>
          </div>
        </div>
      </div>
    );
  };

  const fetchVehiclesList = async () => {
    try {
      setLoadingVehiclesList(true);
      const res = await axios.get('http://localhost:5000/api/transport/vehicles', {
        params: {
          search: vehicleSearch || undefined,
          type: vehicleTypeFilter || undefined,
          status: vehicleStatusFilter || undefined,
        }
      });
      // Support both shapes: raw array and { success, data }
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setVehiclesList(list);
    } catch (err) { console.error('Failed to fetch vehicles', err); }
    finally { setLoadingVehiclesList(false); }
  };

  // Refetch vehicles when filters/search change and Vehicles tab is active
  useEffect(() => {
    if (activeTab === 'vehicles') fetchVehiclesList();
  }, [vehicleSearch, vehicleTypeFilter, vehicleStatusFilter]);

  // Client-side prefix-only filter to ensure first-letter behavior regardless of backend search semantics
  const filteredVehicles = useMemo(() => {
    const q = (vehicleSearch || '').toLowerCase().trim();
    if (!q) return vehiclesList;
    return vehiclesList.filter(v => {
      const id = (v.vehicleId || '').toLowerCase();
      const type = (v.type || '').toLowerCase();
      const plate = (v.specifications?.licensePlate || '').toLowerCase();
      return id.startsWith(q) || type.startsWith(q) || plate.startsWith(q);
    });
  }, [vehiclesList, vehicleSearch]);

  // Fetch Bin Routes when Route tab active and when filters change
  useEffect(() => {
    if (activeTab === 'routes') fetchBinRoutes();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === 'routes') fetchBinRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binFilters]);

  // Reports tab: fetch latest data when entering
  useEffect(() => {
    if (activeTab !== 'reports') return;
    fetchBinRoutes();
    fetchVehiclesList();
    fetchDriversList();
    fetchRequests();
    fetchAssigned();
  }, [activeTab]);

  // PDF helper via print window (user can Save as PDF)
  const openPdfWindow = (title, columns, rows) => {
    const date = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const head = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page { margin: 20px; }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0;
          padding: 0 20px;
          color: #333;
        }
        /* Ensure backgrounds are printed */
        *, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          .header, th {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .header {
          text-align: center;
          margin: 0 -20px 16px -20px;
          padding: 16px 20px;
          background-color: #0c9387; /* blue banner */
          color: #ffffff; /* white text */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header h1 {
          color: #ffffff;
          margin: 0 0 6px 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .header .line { 
          color: #ffffff; 
          font-size: 12px; 
          margin: 2px 0; 
        }
        .report-title {
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: #1a365d;
          margin: 10px 0 4px 0;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }
        th { 
          background-color: #f7fafc;
          color: #4a5568;
          text-align: left;
          padding: 10px;
          border: 1px solid #e2e8f0;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        td { 
          padding: 10px;
          border: 1px solid #e2e8f0;
          color: #2d3748;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #a0aec0;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>`;

    const companyInfo = `
      <div class="header">
        <div style="display:grid;grid-template-columns:152px 1fr 72px;align-items:center;gap:4px;">
          <img src="${window.location.origin}/ecocycle-logo.png" alt="EcoCycle Logo" style="display:block;height:136px;width:136px;object-fit:contain;justify-self:start;" />
          <div style="text-align:center;">
            <h1>ECOCYCLE LANKA (PVT) LTD</h1>
            <div class="line">123 Green Tech Park, Colombo 05, Sri Lanka</div>
            <div class="line">Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com</div>
          </div>
          <div style="width:72px;height:72px;justify-self:end;"></div>
        </div>
      </div>
      <div class="report-title">${title}</div>`;

    const tableHead = `
      <table>
        <thead>
          <tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>`;

    const tableRows = rows.map(row => 
      `<tr>${row.map(cell => `<td>${String(cell || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`
    ).join('');

    const footer = `
        </tbody>
      </table>
      <div class="footer">
        This is a system generated report. For any queries, please contact support@ecocycle.lk
      </div>`;

    const html = `${head}${companyInfo}${tableHead}${tableRows}${footer}</body></html>`;

    // Print via hidden iframe to avoid popup/new tab flicker
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const onLoad = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    };

    if ('srcdoc' in iframe) {
      iframe.onload = onLoad;
      iframe.srcdoc = html;
    } else {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(onLoad, 50);
      }
    }
  };

  const renderOverview = () => (
    <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Package className="text-green-600" size={32} />
            <div>
              <p className="text-gray-500">Bottles Collected Today</p>
              {(() => {
                const today = new Date();
                const isSameDay = (d) => {
                  const dt = new Date(d);
                  return dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth() && dt.getDate() === today.getDate();
                };
                const total = assigned
                  .filter(r => r?.scheduledAt && isSameDay(r.scheduledAt))
                  .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
                const formatted = total.toLocaleString();
                return <h2 className="text-xl font-bold">{formatted}</h2>;
              })()}
              <p className="text-sm text-green-600">Updated from assigned requests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Truck className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-500">Active Vehicles</p>
              {(() => {
                const total = vehiclesList.length;
                const active = vehiclesList.filter(v => v.status === 'Active').length;
                const maint = vehiclesList.filter(v => v.status === 'Maintenance').length;
                return (
                  <>
                    <h2 className="text-xl font-bold">{active}/{total}</h2>
                    <p className="text-sm text-blue-600">{maint} in maintenance</p>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <MapPin className="text-purple-600" size={32} />
            <div>
              <p className="text-gray-500">Active Bin Locations</p>
              {(() => {
                const activeCount = binRoutes.filter(r => (r.status || '').toString() === 'Active').length;
                return <h2 className="text-xl font-bold">{activeCount}</h2>;
              })()}
              <p className="text-sm text-purple-600">Currently active locations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Users className="text-orange-600" size={32} />
            <div>
              <p className="text-gray-500">Active Drivers</p>
              {(() => {
                const total = driversList.length;
                const active = driversList.filter(d => {
                  const cs = (d.currentStatus || '').toString().toLowerCase();
                  const es = (d.employmentStatus || '').toString().toLowerCase();
                  const s = (d.status || '').toString().toLowerCase();
                  return cs === 'active' || es === 'active' || s === 'active';
                }).length;
                return <h2 className="text-xl font-bold">{active}/{total}</h2>;
              })()}
              <p className="text-sm text-orange-600">Transport department</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Transport Requests Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              {(() => {
                const pending = requests.length;
                const assignedCnt = assigned.filter(r => r.status === 'Assigned').length;
                const pickedUpCnt = assigned.filter(r => r.status === 'PickedUp').length;
                const deliveredCnt = assigned.filter(r => r.status === 'Delivered').length;
                const data = [
                  { name: 'Pending', value: pending },
                  { name: 'Assigned', value: assignedCnt },
                  { name: 'Picked Up', value: pickedUpCnt },
                  { name: 'Delivered', value: deliveredCnt },
                  { name: 'Rejected', value: rejectedCount },
                ].filter(x => x.value > 0);
                return (
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-req-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                );
              })()}
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Monthly collection of bottles by status</h2>
          <ResponsiveContainer width="100%" height={300}>
            {(() => {
              const sumQty = (arr) => arr.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
              const pendingQty = sumQty(requests);
              const assignedQty = sumQty(assigned.filter(r => r.status === 'Assigned'));
              const pickedQty = sumQty(assigned.filter(r => r.status === 'PickedUp'));
              const deliveredQty = sumQty(assigned.filter(r => r.status === 'Delivered'));
              const rejectedQty = rejectedCount; // if needed as quantity, keep as count; often rejections have no qty moved
              const data = [
                { name: 'Pending', bottles: pendingQty },
                { name: 'Assigned', bottles: assignedQty },
                { name: 'Picked Up', bottles: pickedQty },
                { name: 'Delivered', bottles: deliveredQty },
              ];
              return (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bottles" fill="#10b981" name="Bottles" />
                </BarChart>
              );
            })()}
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );

  const renderAssigned = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Assigned Transport Requests</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAssigned}>Refresh</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loadingAssigned ? (
          <div className="text-gray-600 p-3">Loading assigned...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Stock ID</th>
                <th className="p-3">Scheduled Time</th>
                <th className="p-3">Driver</th>
                <th className="p-3">Collector</th>
                <th className="p-3">Bottle Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map(r => (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{r.requestId || (r._id?.slice(-6) || '-')}</td>
                  <td className="p-3">{r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : '-'}</td>
                  <td className="p-3">{getDriverNameById(r.assignedDriverId)}</td>
                  <td className="p-3">{r.collectorName}</td>
                  <td className="p-3">{r.bottleType}</td>
                  <td className="p-3 font-semibold">{r.quantity}</td>
                  <td className="p-3">{r.location || '-'}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{r.status}</span></td>
                </tr>
              ))}
              {assigned.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={8}>No assigned requests</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );

  const renderRequests = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Pending Transport Requests</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRequests}>Refresh</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loadingRequests ? (
          <div className="text-gray-600 p-3">Loading requests...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Request ID</th>
                <th className="p-3">Requested At</th>
                <th className="p-3">Collector</th>
                <th className="p-3">Bottle Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{r.requestId || (r._id?.slice(-6) || '-')}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3">{r.collectorName}</td>
                  <td className="p-3">{r.bottleType}</td>
                  <td className="p-3 font-semibold">{r.quantity}</td>
                  <td className="p-3">{r.location || '-'}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{r.status}</span></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={async ()=>{
                        // Open modal to choose driver and schedule
                        setAssignRequestId(r._id);
                        setShowAssignModal(true);
                        // Initialize default schedule time (next hour)
                        try {
                          const now = new Date();
                          now.setMinutes(0,0,0);
                          now.setHours(now.getHours() + 1);
                          const pad = (n)=>String(n).padStart(2,'0');
                          const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                          setScheduledAt(local);
                          const nowMin = new Date();
                          const minLocal = `${nowMin.getFullYear()}-${pad(nowMin.getMonth()+1)}-${pad(nowMin.getDate())}T${pad(nowMin.getHours())}:${pad(nowMin.getMinutes())}`;
                          setScheduleMin(minLocal);
                          setSelectedVehicleId("");
                        } catch {}
                        // Fetch drivers list
                        try {
                          setLoadingDrivers(true);
                          const res = await axios.get('http://localhost:5000/api/employees', {
                            params: { department: 'transport', position: 'Driver', status: 'active' }
                          });
                          const payload = res?.data;
                          const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
                          const onlyActive = list.filter(d => {
                            const cs = (d.currentStatus || '').toString().toLowerCase();
                            const es = (d.employmentStatus || '').toString().toLowerCase();
                            const s = (d.status || '').toString().toLowerCase();
                            return cs === 'active' || es === 'active' || s === 'active';
                          });
                          setDrivers(onlyActive);
                        } catch (err) { console.error('Failed to load drivers', err); }
                        finally { setLoadingDrivers(false); }
                        // Fetch active vehicles for display in Assign modal
                        try {
                          setLoadingVehiclesAssign(true);
                          const vres = await axios.get('http://localhost:5000/api/transport/vehicles', {
                            params: { status: 'Active' }
                          });
                          const vpayload = vres?.data;
                          const vlist = Array.isArray(vpayload) ? vpayload : Array.isArray(vpayload?.data) ? vpayload.data : [];
                          const activeVehicles = vlist.filter(v => (v.status || '').toString().toLowerCase() === 'active');
                          setVehiclesAssign(activeVehicles);
                        } catch (err) { console.error('Failed to load vehicles for assign', err); }
                        finally { setLoadingVehiclesAssign(false); }
                      }}>Assign</Button>
                      <Button size="sm" variant="outline" onClick={async ()=>{
                        try {
                          await axios.post(`http://localhost:5000/api/transport-requests/${r._id}/status`, { status: 'Cancelled' });
                          fetchRequests();
                        } catch (err) { console.error(err); }
                      }}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={7}>No pending requests</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );

  const renderRoutes = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Bin Locations</h2>
        <Button className="bg-purple-600 text-white" onClick={()=>{
          setAddBinRouteForm({ location: '', managerName: '', status: 'Active', distanceKm: '' });
          setAddBinRouteErrors({});
          setShowAddRoute(true);
        }}><Plus size={16} className="mr-2" />Add Location</Button>
      </div>
      {/* Available Bin Routes (persisted) */}
      <Card className="mb-6 p-4 shadow rounded-2xl">
        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Search (location, manager, route)" value={binFilters.search} onChange={(e)=>setBinFilters({...binFilters, search: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="City" value={binFilters.city} onChange={(e)=>setBinFilters({...binFilters, city: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="Manager" value={binFilters.manager} onChange={(e)=>setBinFilters({...binFilters, manager: e.target.value})} />
          <select className="border rounded-lg px-3 py-2 w-full" value={binFilters.status} onChange={(e)=>setBinFilters({...binFilters, status: e.target.value})}>
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Maintenance</option>
          </select>
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={fetchBinRoutes}>Refresh</Button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingBinRoutes && <div className="text-gray-600">Loading bin routes...</div>}
          {!loadingBinRoutes && binRoutes.map((r)=> (
            <div key={r._id || r.id} className="border rounded-2xl p-4 hover:shadow transition bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">Location ID</div>
                  <div className="font-semibold">{r.routeId || r.id}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${r.status==='Active' ? 'bg-green-100 text-green-700' : r.status==='Maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
              </div>
              {editingBinId === (r._id || r.id) ? (
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <input
                      className="border rounded-lg px-2 py-1 w-full"
                      value={editingBinData.location}
                      onChange={(e)=>{
                        const cleaned = e.target.value.replace(/[^A-Za-z0-9 ,\-]/g, '');
                        const collapsed = cleaned.replace(/\s+/g, ' ').trim();
                        setEditingBinData({...editingBinData, location: collapsed});
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">City</div>
                    <input className="border rounded-lg px-2 py-1 w-full" value={editingBinData.city} onChange={(e)=>setEditingBinData({...editingBinData, city: e.target.value})} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Collection Manager</div>
                    <input
                      className="border rounded-lg px-2 py-1 w-full"
                      value={editingBinData.managerName}
                      onChange={(e)=>{
                        const onlyLettersSpaces = e.target.value.replace(/[^A-Za-z\s]/g, '');
                        const collapsed = onlyLettersSpaces.replace(/\s+/g, ' ').trim();
                        const titleCased = collapsed.split(' ').map(w => w ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ');
                        setEditingBinData({...editingBinData, managerName: titleCased});
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="border rounded-lg px-2 py-1" value={editingBinData.status} onChange={(e)=>setEditingBinData({...editingBinData, status: e.target.value})}>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Maintenance</option>
                    </select>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className="border rounded-lg px-2 py-1"
                      value={editingBinData.distanceKm}
                      onKeyDown={(e)=>{
                        if (["e","E","+","-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e)=>{
                        const raw = e.target.value;
                        let cleaned = raw.replace(/[^0-9.]/g, "");
                        cleaned = cleaned.replace(/(\..*)\./g, "$1");
                        const parts = cleaned.split('.')
                        let intPart = parts[0].replace(/^(0+)(\d)/, '$2');
                        if (intPart === '') intPart = '0';
                        let result = intPart;
                        if (parts.length > 1) {
                          const decPart = parts[1].slice(0, 2);
                          result = decPart.length > 0 ? `${intPart}.${decPart}` : `${intPart}.`;
                        }
                        setEditingBinData({...editingBinData, distanceKm: result});
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={()=>{ setEditingBinId(null); }}>Cancel</Button>
                    <Button className="bg-blue-600 text-white" onClick={async ()=>{
                      try {
                        await axios.put(`http://localhost:5000/api/transport/bin-routes/${r._id || r.id}` , {
                          location: editingBinData.location,
                          city: editingBinData.city,
                          managerName: editingBinData.managerName,
                          status: editingBinData.status,
                          distanceKm: Number(editingBinData.distanceKm)
                        });
                        setEditingBinId(null);
                        fetchBinRoutes();
                      } catch (err) { console.error('Update bin route failed', err); }
                    }}>Save</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{r.location}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">City</div>
                    <div>{r.city}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">Collection Manager</div>
                    <div>{r.managerName}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">Distance</div>
                    <div>{r.distanceKm} km</div>
                  </div>
                  <div className="mt-3 flex gap-2 justify-end">
                    <Button variant="outline" onClick={()=>{
                      setEditingBinId(r._id || r.id);
                      setEditingBinData({ location: r.location || '', city: r.city || '', managerName: r.managerName || '', status: r.status || 'Active', distanceKm: r.distanceKm ?? '' });
                    }}>Edit</Button>
                    <Button variant="outline" className="text-red-600" onClick={async ()=>{
                      try {
                        if (!window.confirm('Remove this bin route?')) return;
                        await axios.delete(`http://localhost:5000/api/transport/bin-routes/${r._id || r.id}`);
                        fetchBinRoutes();
                      } catch (err) { console.error('Remove bin route failed', err); }
                    }}>Remove</Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
      {/* Removed routes summary table */}
      {showAddRoute && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[720px] max-w-[95vw] rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Bin Location</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>setShowAddRoute(false)}>✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input className="border rounded-lg px-3 py-2 w-full" value={addBinRouteForm.location} onChange={(e)=>setAddBinRouteForm({...addBinRouteForm, location: e.target.value})} placeholder="e.g., Keells Nugegoda" />
                {addBinRouteErrors.location && <div className="text-xs text-red-600 mt-1">{addBinRouteErrors.location}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Collection Manager</label>
                <input className="border rounded-lg px-3 py-2 w-full" value={addBinRouteForm.managerName} onChange={(e)=>setAddBinRouteForm({...addBinRouteForm, managerName: e.target.value})} placeholder="Manager name" />
                {addBinRouteErrors.managerName && <div className="text-xs text-red-600 mt-1">{addBinRouteErrors.managerName}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={addBinRouteForm.status} onChange={(e)=>setAddBinRouteForm({...addBinRouteForm, status: e.target.value})}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Maintenance</option>
                </select>
                {addBinRouteErrors.status && <div className="text-xs text-red-600 mt-1">{addBinRouteErrors.status}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Distance (km)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addBinRouteForm.distanceKm}
                  onKeyDown={(e)=>{
                    // Block scientific notation and signs; allow one dot handled in onChange
                    if (["e","E","+","-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e)=>{
                    const raw = e.target.value;
                    let cleaned = raw.replace(/[^0-9.]/g, "");
                    cleaned = cleaned.replace(/(\..*)\./g, "$1");
                    const parts = cleaned.split('.')
                    let intPart = parts[0].replace(/^(0+)(\d)/, '$2');
                    if (intPart === '') intPart = '0';
                    let result = intPart;
                    if (parts.length > 1) {
                      const decPart = parts[1].slice(0, 2); // limit to 2 decimal places
                      result = decPart.length > 0 ? `${intPart}.${decPart}` : `${intPart}.`;
                    }
                    setAddBinRouteForm({...addBinRouteForm, distanceKm: result});
                  }}
                  placeholder="e.g., 12.50"
                />
                {addBinRouteErrors.distanceKm && <div className="text-xs text-red-600 mt-1">{addBinRouteErrors.distanceKm}</div>}
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="border px-4 py-2 rounded-lg" onClick={()=>setShowAddRoute(false)}>Cancel</button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg" onClick={async ()=>{
                try {
                  const { valid } = validateAddBinRouteForm();
                  if (!valid) return;
                  await axios.post('http://localhost:5000/api/transport/bin-routes', {
                    location: addBinRouteForm.location.trim(),
                    managerName: addBinRouteForm.managerName.trim(),
                    status: addBinRouteForm.status,
                    distanceKm: Number(addBinRouteForm.distanceKm)
                  });
                  setShowAddRoute(false);
                  setAddBinRouteForm({ location: '', managerName: '', status: 'Active', distanceKm: '' });
                  setAddBinRouteErrors({});
                  fetchBinRoutes();
                } catch (err) { console.error('Create bin route failed', err); }
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  const renderVehicles = () => (
    <div className="grid grid-cols-1 gap-6">
      <Card className="p-4 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Vehicle Fleet</h2>
          <Button className="bg-blue-600 text-white" onClick={() => setShowAddVehicle(true)}>
            <Plus size={16} className="mr-2" />Add Vehicle
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by ID, type, model, plate..."
            className="border rounded-lg px-3 py-2 w-full md:w-1/3"
            value={vehicleSearch}
            onChange={(e)=>setVehicleSearch(e.target.value)}
          />
          <select className="border rounded-lg px-3 py-2 w-full md:w-48" value={vehicleTypeFilter} onChange={(e)=>setVehicleTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option>Small Truck</option>
            <option>Medium Truck</option>
            <option>Large Truck</option>
            <option>Van</option>
          </select>
          <select className="border rounded-lg px-3 py-2 w-full md:w-48" value={vehicleStatusFilter} onChange={(e)=>setVehicleStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Maintenance</option>
            <option>Out of Service</option>
          </select>
          <button className="border rounded-lg px-3 py-2" onClick={fetchVehiclesList}>Refresh</button>
        </div>
        {loadingVehiclesList ? (
          <div className="p-4 text-gray-600">Loading vehicles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((v) => {
                  return (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.vehicleId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.capacity?.bottles || 0} bottles · {v.capacity?.weight || 0} kg</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.specifications?.licensePlate || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.fuel?.level ?? 0}% {v.fuel?.fuelType ? `· ${v.fuel.fuelType}` : ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{v.maintenance?.status || 'Good'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border rounded" onClick={() => {
                            setEditingVehicle(v);
                            setEditVehicleForm({
                              vehicleId: v.vehicleId || "",
                              type: v.type || "Medium Truck",
                              capacityBottles: v.capacity?.bottles ?? "",
                              capacityWeight: v.capacity?.weight ?? "",
                              licensePlate: v.specifications?.licensePlate || "",
                              status: v.status || "Active",
                              fuelLevel: v.fuel?.level ?? 100,
                              fuelType: v.fuel?.fuelType || "Diesel",
                              maintenanceStatus: v.maintenance?.status || "Good",
                            });
                            setShowEditVehicle(true);
                          }}>Edit</button>
                          <button className="px-3 py-1 border rounded text-red-600" onClick={async () => {
                            if (!window.confirm('Delete this vehicle permanently?')) return;
                            try {
                              await axios.delete(`http://localhost:5000/api/transport/vehicles/${v._id}`);
                              fetchVehiclesList();
                            } catch (err) { console.error('Delete vehicle failed', err); }
                          }}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-600">No vehicles found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddVehicle && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[900px] max-w-[95vw] rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Vehicle</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAddVehicle(false)}>✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle ID</label>
                <input
                  type="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.vehicleId}
                  maxLength={20}
                  placeholder="2–20 characters: letters, numbers, - or _"
                  title="Letters (A–Z), numbers (0–9), hyphen (-) and underscore (_). 2–20 characters."
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^A-Za-z0-9-_]/g, '').slice(0, 20);
                    setAddVehicleForm({ ...addVehicleForm, vehicleId: sanitized });
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">Allowed: letters, numbers, hyphen (-), underscore (_). Length 2–20.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={addVehicleForm.type} onChange={(e) => setAddVehicleForm({ ...addVehicleForm, type: e.target.value })}>
                  <option>Small Truck</option>
                  <option>Medium Truck</option>
                  <option>Large Truck</option>
                  <option>Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={addVehicleForm.status} onChange={(e) => setAddVehicleForm({ ...addVehicleForm, status: e.target.value })}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Maintenance</option>
                  <option>Out of Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Bottles)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.capacityBottles}
                  onKeyDown={(e)=>{
                    // Block non-integer characters like '.', 'e', '+', '-'
                    if (["e","E","+","-","."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                    setAddVehicleForm({ ...addVehicleForm, capacityBottles: digitsOnly });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Weight kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.capacityWeight}
                  onKeyDown={(e)=>{
                    // Block scientific notation and signs; allow one dot handled in onChange
                    if (["e","E","+","-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Keep digits and at most one dot
                    let cleaned = raw.replace(/[^0-9.]/g, "");
                    cleaned = cleaned.replace(/(\..*)\./g, "$1");
                    const parts = cleaned.split('.');
                    let intPart = parts[0].replace(/^(0+)(\d)/, '$2'); // trim leading zeros but keep single 0
                    if (intPart === '') intPart = '0';
                    let result = intPart;
                    if (parts.length > 1) {
                      const decPart = parts[1].slice(0, 2); // limit to 2 decimals
                      result = decPart.length > 0 ? `${intPart}.${decPart}` : `${intPart}.`;
                    }
                    setAddVehicleForm({ ...addVehicleForm, capacityWeight: result });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.model}
                  maxLength={20}
                  placeholder="Letters only"
                  title="Only letters A–Z. Max 20 characters."
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z]/g, '');
                    const limited = onlyLetters.slice(0, 20);
                    setAddVehicleForm({ ...addVehicleForm, model: limited });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">License Plate</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.licensePlate}
                  maxLength={8}
                  placeholder="e.g., ABC-1234"
                  title="Format: up to 3 letters followed by up to 4 digits (e.g., ABC-1234)."
                  onChange={(e) => {
                    // Enforce up to 3 letters then up to 4 digits. Auto-insert hyphen when digits present.
                    const upper = e.target.value.toUpperCase();
                    // Remove all non alphanumeric
                    const alnum = upper.replace(/[^A-Z0-9]/g, '');
                    // Extract leading letters (max 3)
                    const letters = (alnum.match(/^[A-Z]{0,3}/)?.[0] || '');
                    // Remaining digits after letters (max 4)
                    const digits = (alnum.slice(letters.length).match(/^\d{0,4}/)?.[0] || '');
                    const formatted = digits.length > 0 ? `${letters}${letters ? '-' : ''}${digits}` : letters;
                    setAddVehicleForm({ ...addVehicleForm, licensePlate: formatted });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.color}
                  maxLength={20}
                  placeholder="e.g., Dark Blue"
                  title="Letters and spaces only. Max 20 characters."
                  onChange={(e) => {
                    const onlyLettersSpaces = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    const collapsed = onlyLettersSpaces.replace(/\s+/g, ' ').trim();
                    const titleCased = collapsed.split(' ').map(w => w ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ');
                    const limited = titleCased.slice(0, 20);
                    setAddVehicleForm({ ...addVehicleForm, color: limited });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fuel Level (%)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={addVehicleForm.fuelLevel}
                  onKeyDown={(e)=>{
                    // Block non-integer characters like '.', 'e', '+', '-'
                    if (["e","E","+","-","."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                    let val = digitsOnly === '' ? '' : Number(digitsOnly);
                    if (val !== '' && !Number.isNaN(val)) {
                      if (val < 0) val = 0;
                      if (val > 100) val = 100;
                    }
                    setAddVehicleForm({ ...addVehicleForm, fuelLevel: val });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={addVehicleForm.fuelType} onChange={(e) => setAddVehicleForm({ ...addVehicleForm, fuelType: e.target.value })}>
                  <option>Diesel</option>
                  <option>Petrol</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Status</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={addVehicleForm.maintenanceStatus} onChange={(e) => setAddVehicleForm({ ...addVehicleForm, maintenanceStatus: e.target.value })}>
                  <option>Good</option>
                  <option>Service Due</option>
                  <option>Needs Repair</option>
                  <option>In Service</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="border px-4 py-2 rounded-lg" onClick={() => setShowAddVehicle(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={async () => {
                try {
                  const form = { ...addVehicleForm };
                  const { valid, errors } = validateVehicleForm({
                    vehicleId: form.vehicleId,
                    type: form.type,
                    capacityBottles: form.capacityBottles,
                    capacityWeight: form.capacityWeight,
                    model: form.model,
                    licensePlate: form.licensePlate,
                    color: form.color,
                    status: form.status,
                    fuelLevel: form.fuelLevel,
                    fuelType: form.fuelType,
                    maintenanceStatus: form.maintenanceStatus,
                  });
                  if (!valid) {
                    const firstError = Object.values(errors)[0] || 'Please fix form errors.';
                    window.alert(firstError);
                    return;
                  }
                  const payload = mapFormToVehiclePayload(form);
                  await axios.post('http://localhost:5000/api/transport/vehicles', payload);
                  window.alert('Vehicle created successfully');
                  setShowAddVehicle(false);
                  setAddVehicleForm({
                    vehicleId: "", type: "Medium Truck", capacityBottles: "", capacityWeight: "",
                    model: "", licensePlate: "", color: "", status: "Active",
                    fuelLevel: 100, fuelType: "Diesel", maintenanceStatus: "Good",
                  });
                  fetchVehiclesList();
                } catch (err) {
                  console.error('Create vehicle failed', err);
                  const msg = err?.response?.data?.message || 'Failed to create vehicle. Please try again.';
                  window.alert(msg);
                }
              }}>Save Vehicle</button>
            </div>
          </div>
        </div>
      )}

      {showEditVehicle && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-[900px] max-w-[95vw] rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Vehicle - {editingVehicle.vehicleId}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>{ setShowEditVehicle(false); setEditingVehicle(null); }}>✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle ID</label>
                <input
                  type="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={editVehicleForm.vehicleId}
                  maxLength={20}
                  placeholder="2–20 characters: letters, numbers, - or _"
                  title="Letters (A–Z), numbers (0–9), hyphen (-) and underscore (_). 2–20 characters."
                  onChange={(e)=>{
                    const sanitized = e.target.value.replace(/[^A-Za-z0-9-_]/g, '').slice(0,20);
                    setEditVehicleForm({...editVehicleForm, vehicleId: sanitized});
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.type} onChange={(e)=>setEditVehicleForm({...editVehicleForm, type: e.target.value})}>
                  <option>Small Truck</option>
                  <option>Medium Truck</option>
                  <option>Large Truck</option>
                  <option>Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.status} onChange={(e)=>setEditVehicleForm({...editVehicleForm, status: e.target.value})}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Maintenance</option>
                  <option>Out of Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Bottles)</label>
                <input type="number" className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.capacityBottles} onChange={(e)=>setEditVehicleForm({...editVehicleForm, capacityBottles: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (Weight kg)</label>
                <input type="number" className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.capacityWeight} onChange={(e)=>setEditVehicleForm({...editVehicleForm, capacityWeight: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License Plate</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="border rounded-lg px-3 py-2 w-full"
                  value={editVehicleForm.licensePlate}
                  maxLength={12}
                  placeholder="e.g., ABC-1234"
                  title="Letters, numbers, hyphen and spaces only. Max 12 characters."
                  onChange={(e)=>{
                    const upper = e.target.value.toUpperCase();
                    const allowed = upper.replace(/[^A-Z0-9\-\s]/g, '');
                    const collapsed = allowed.replace(/\s+/g, ' ').trim();
                    const limited = collapsed.slice(0, 12);
                    setEditVehicleForm({...editVehicleForm, licensePlate: limited});
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Level (%)</label>
                <input type="number" min="0" max="100" className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.fuelLevel} onChange={(e)=>setEditVehicleForm({...editVehicleForm, fuelLevel: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.fuelType} onChange={(e)=>setEditVehicleForm({...editVehicleForm, fuelType: e.target.value})}>
                  <option>Diesel</option>
                  <option>Petrol</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Status</label>
                <select className="border rounded-lg px-3 py-2 w-full" value={editVehicleForm.maintenanceStatus} onChange={(e)=>setEditVehicleForm({...editVehicleForm, maintenanceStatus: e.target.value})}>
                  <option>Good</option>
                  <option>Service Due</option>
                  <option>Needs Repair</option>
                  <option>In Service</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button className="border px-4 py-2 rounded-lg" onClick={()=>{ setShowEditVehicle(false); setEditingVehicle(null); }}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={async ()=>{
                try {
                  if (!editingVehicle?._id) return;
                  const payload = {
                    vehicleId: editVehicleForm.vehicleId,
                    type: editVehicleForm.type,
                    capacity: {
                      bottles: Number(editVehicleForm.capacityBottles) || 0,
                      weight: Number(editVehicleForm.capacityWeight) || 0,
                    },
                    specifications: {
                      licensePlate: editVehicleForm.licensePlate,
                    },
                    status: editVehicleForm.status,
                    fuel: {
                      level: Number(editVehicleForm.fuelLevel) || 0,
                      fuelType: editVehicleForm.fuelType,
                    },
                    maintenance: {
                      status: editVehicleForm.maintenanceStatus,
                    },
                  };
                  await axios.put(`http://localhost:5000/api/transport/vehicles/${editingVehicle._id}`, payload);
                  setShowEditVehicle(false);
                  setEditingVehicle(null);
                  fetchVehiclesList();
                } catch (err) { console.error('Update vehicle failed', err); }
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDrivers = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Driver Management</h2>
        <button className="border rounded-lg px-3 py-2" onClick={fetchDriversList}>Refresh</button>
      </div>
      {loadingDriversList ? (
        <div className="p-4 text-gray-600">Loading drivers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {driversList.map(d => {
            const name = (d.fullName || '').trim() || d.employeeId;
            return (
              <div key={d._id} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-gray-500">Employee: {d.employeeId}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{d.email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{d.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Department</span><span>{d.department}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Position</span><span>{d.position}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-medium ${String(d.status).toLowerCase()==='active'?'text-green-600':'text-gray-700'}`}>{d.status}</span></div>
                </div>
              </div>
            );
          })}
          {driversList.length === 0 && (
            <div className="p-4 text-gray-600">No drivers found</div>
          )}
        </div>
      )}
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "requests": return renderRequests();
      case "assigned": return renderAssigned();
      case "routes": return renderRoutes();
      case "vehicles": return renderVehicles();
      case "drivers": return renderDrivers();
      case "reports": return renderReports();
      default: return renderOverview();
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'assigned') fetchAssigned();
    if (activeTab === 'drivers') fetchDriversList();
    if (activeTab === 'vehicles') fetchVehiclesList();
    if (activeTab === 'routes') fetchRoutesList();
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Truck className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transport Hub</h2>
              <p className="text-sm text-gray-500">Fleet Management</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transport Dashboard</h1>
              <p className="text-gray-600 mt-1">Fleet operations and logistics management</p>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={()=>setActiveTab('reports')}>
                <FileText className="mr-2 h-5 w-5" />
                Report
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
        {/* Global modals */}
        <AssignModal />
      </div>
    </div>
  );
}
//remove mock data
