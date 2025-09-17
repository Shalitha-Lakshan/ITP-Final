// src/components/transport/TransportDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle, Plus, Search, Filter, Navigation, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import LogoutButton from "../common/LogoutButton";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// helpers
const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TransportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [routeStatusData, setRouteStatusData] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [collectionsRes, routesRes, vehiclesRes, driversRes, analyticsRes, dashboardRes] = await Promise.all([
          axios.get(`${API_BASE}/api/transport/collections`),
          axios.get(`${API_BASE}/api/transport/routes`),
          axios.get(`${API_BASE}/api/transport/vehicles`),
          axios.get(`${API_BASE}/api/transport/drivers`),
          axios.get(`${API_BASE}/api/transport/analytics`),
          axios.get(`${API_BASE}/api/transport/dashboard`)
        ]);

        if (!isMounted) return;

        const list = collectionsRes.data || [];
        setCollections(list);
        setRoutes(routesRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setDrivers(driversRes.data || []);
        setDashboard(dashboardRes.data || null);

        // monthly trends -> chart
        const monthly = (analyticsRes.data?.monthlyTrends || []).map(m => {
          const monthIndex = (m._id?.month || 1) - 1;
          const collected = m.collected || 0;
          const scheduled = m.scheduled || 0;
          const efficiency = scheduled > 0 ? (collected / scheduled) * 100 : 0;
          return { month: monthNames[monthIndex], collected, scheduled, efficiency: Number(efficiency.toFixed(1)) };
        });
        setCollectionData(monthly);

        // status distribution pie
        const statusCounts = { Completed: 0, "In Progress": 0, Scheduled: 0, Delayed: 0 };
        for (const c of list) {
          const s = c.status || 'Scheduled';
          if (statusCounts[s] !== undefined) statusCounts[s] += 1;
        }
        const total = Object.values(statusCounts).reduce((a,b)=>a+b,0) || 1;
        const routePie = Object.entries(statusCounts).map(([name,count]) => ({ name, count, value: Math.round((count/total)*100) }));
        setRouteStatusData(routePie);

        setError("");
      } catch (e) {
        console.error("Transport data load failed", e);
        setError("Failed to load transport data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, []);

  const menuItems = [
    { name: "Transport Overview", key: "overview", icon: <Truck size={20} /> },
    { name: "Active Collections", key: "collections", icon: <Package size={20} /> },
    { name: "Route Management", key: "routes", icon: <MapPin size={20} /> },
    { name: "Vehicle Fleet", key: "vehicles", icon: <Truck size={20} /> },
    { name: "Driver Management", key: "drivers", icon: <Users size={20} /> },
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle size={16} className="text-green-600" />;
      case "In Progress": return <Clock size={16} className="text-blue-600" />;
      case "Scheduled": return <Clock size={16} className="text-yellow-600" />;
      case "Delayed": return <AlertCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
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
              <h2 className="text-xl font-bold">{dashboard?.todayBottles ?? 0}</h2>
              <p className="text-sm text-green-600">{dashboard ? `${Math.round(dashboard.routeEfficiency || 0)}% avg progress` : ''}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Truck className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-500">Active Vehicles</p>
              <h2 className="text-xl font-bold">{dashboard ? `${dashboard.activeVehicles}/${dashboard.totalVehicles}` : '0/0'}</h2>
              <p className="text-sm text-blue-600">Fleet status</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <MapPin className="text-purple-600" size={32} />
            <div>
              <p className="text-gray-500">Routes Completed</p>
              <h2 className="text-xl font-bold">{routeStatusData.find(r=>r.name==='Completed')?.count || 0}/{collections.length}</h2>
              <p className="text-sm text-purple-600">{dashboard ? `${Math.round(dashboard.routeEfficiency || 0)}% avg efficiency` : ''}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Clock className="text-orange-600" size={32} />
            <div>
              <p className="text-gray-500">Avg Collection Time</p>
              <h2 className="text-xl font-bold">{routes[0]?.estimatedDuration || '—'}</h2>
              <p className="text-sm text-orange-600">From route estimates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Monthly Collection Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#16a34a" name="Collected" />
              <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <h2 className="text-lg font-bold mb-4">Route Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={routeStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {routeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );

  const renderCollections = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Active Collections</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Search size={16} className="mr-2" />Search</Button>
          <Button variant="outline" size="sm"><Filter size={16} className="mr-2" />Filter</Button>
          <Button className="bg-green-600 text-white"><Plus size={16} className="mr-2" />New Collection</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Collection ID</th>
              <th className="p-3">Location</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Bottles</th>
              <th className="p-3">Status</th>
              <th className="p-3">Time</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(collection => {
              const driverName = collection.assignedDriver ? `${collection.assignedDriver.personalInfo?.firstName || ''} ${collection.assignedDriver.personalInfo?.lastName || ''}`.trim() : '—';
              const vehicleId = collection.assignedVehicle?.vehicleId || '—';
              const collected = collection.bottleCount?.collected ?? 0;
              const scheduled = collection.bottleCount?.scheduled ?? 0;
              const computedProgress = scheduled > 0 ? Math.round((collected / scheduled) * 100) : (collection.progress ?? 0);
              const start = collection.scheduledTime?.startTime ? new Date(collection.scheduledTime.startTime).toLocaleTimeString() : '—';
              const eta = collection.scheduledTime?.estimatedCompletionTime ? new Date(collection.scheduledTime.estimatedCompletionTime).toLocaleTimeString() : '—';
              return (
              <tr key={collection._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{collection.collectionId || collection._id?.slice(-6)}</td>
                <td className="p-3">{collection.location}</td>
                <td className="p-3">{driverName}</td>
                <td className="p-3">{vehicleId}</td>
                <td className="p-3 font-bold">{collected}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(collection.status || 'Scheduled')}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status || 'Scheduled')}`}>
                      {collection.status || 'Scheduled'}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <p className="text-sm">Start: {start}</p>
                    <p className="text-sm text-gray-500">ETA: {eta}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${computedProgress}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{computedProgress}%</span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm"><Navigation size={16} /></Button>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderRoutes = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Transport Routes</h2>
        <Button className="bg-purple-600 text-white"><Plus size={16} className="mr-2" />Add Route</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Route ID</th>
              <th className="p-3">Route Name</th>
              <th className="p-3">Locations</th>
              <th className="p-3">Distance</th>
              <th className="p-3">Avg Time</th>
              <th className="p-3">Frequency</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{route.routeId || route._id?.slice(-6)}</td>
                <td className="p-3">{route.name}</td>
                <td className="p-3">{Array.isArray(route.locations) ? route.locations.length : (route.locations || 0)} stops</td>
                <td className="p-3">{route.distance || '—'}</td>
                <td className="p-3">{route.estimatedDuration || '—'}</td>
                <td className="p-3">{route.frequency || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('Active')}`}>Active</span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm"><MapPin size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderVehicles = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4 shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Vehicle Fleet</h2>
          <Button className="bg-blue-600 text-white"><Plus size={16} className="mr-2" />Add Vehicle</Button>
        </div>
        <div className="space-y-4">
          {vehicles.map(vehicle => (
            <div key={vehicle._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{vehicle.vehicleId || vehicle._id?.slice(-6)} - {vehicle.type}</h3>
                  <p className="text-sm text-gray-500">Driver: {vehicle.assignedDriver ? `${vehicle.assignedDriver.personalInfo?.firstName || ''} ${vehicle.assignedDriver.personalInfo?.lastName || ''}`.trim() : '—'}</p>
                  <p className="text-sm text-gray-500">Capacity: {vehicle.capacity || '—'} bottles</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status || 'Active')}`}>
                  {vehicle.status || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Current Location</p>
                  <p className="text-sm font-medium">{vehicle.currentLocation?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fuel Level</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${(vehicle.fuelLevel ?? 0) > 50 ? 'bg-green-600' : (vehicle.fuelLevel ?? 0) > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${vehicle.fuelLevel ?? 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{vehicle.fuelLevel ?? 0}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs ${(vehicle.maintenanceStatus || 'Good') === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
                  {vehicle.maintenanceStatus || 'Good'}
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Track</Button>
                  <Button variant="outline" size="sm">Maintain</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 shadow-lg rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Fleet Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={collectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="efficiency" stroke="#16a34a" strokeWidth={3} name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Average Efficiency</span>
            <span className="text-sm font-medium">{collectionData.length ? `${(
              collectionData.reduce((acc, m) => acc + (m.efficiency || 0), 0) / collectionData.length
            ).toFixed(1)}%` : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Distance (Month)</span>
            <span className="text-sm font-medium">—</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fuel Consumption</span>
            <span className="text-sm font-medium">—</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDrivers = () => (
    <Card className="p-4 shadow-lg rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Driver Management</h2>
        <Button className="bg-indigo-600 text-white"><Plus size={16} className="mr-2" />Add Driver</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(driver => (
          <div key={driver._id} className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{`${driver.personalInfo?.firstName || ''} ${driver.personalInfo?.lastName || ''}`.trim() || '—'}</h3>
                <p className="text-sm text-gray-500">Vehicle: {driver.assignedVehicle?.vehicleId || '—'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${(driver.currentStatus || 'On Duty') === 'On Duty' ? 'text-green-600' : 'text-orange-600'}`}>
                  {driver.currentStatus || 'On Duty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Location</span>
                <span className="text-sm">{driver.currentLocation?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Collections Today</span>
                <span className="text-sm font-medium">—</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button variant="outline" size="sm">Contact</Button>
              <Button variant="outline" size="sm">Schedule</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "collections": return renderCollections();
      case "routes": return renderRoutes();
      case "vehicles": return renderVehicles();
      case "drivers": return renderDrivers();
      default: return renderOverview();
    }
  };

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
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Export Report</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus size={16} className="mr-2" />Quick Collection
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}
          {loading ? (
            <div className="w-full py-24 text-center text-gray-500">Loading transport data...</div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}