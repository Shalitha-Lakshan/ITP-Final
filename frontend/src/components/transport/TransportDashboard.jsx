// src/components/transport/TransportDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle, Plus, Search, Filter, Navigation, Users } from "lucide-react";
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

const transportRoutes = [
  { id: "RT001", name: "City Center Route", locations: 8, distance: "25 km", avgTime: "3.5 hrs", frequency: "Daily", status: "Active" },
  { id: "RT002", name: "Suburban Route", locations: 12, distance: "35 km", avgTime: "4.2 hrs", frequency: "Daily", status: "Active" },
  { id: "RT003", name: "Industrial Route", locations: 6, distance: "18 km", avgTime: "2.8 hrs", frequency: "Twice Daily", status: "Active" },
  { id: "RT004", name: "Weekend Route", locations: 15, distance: "42 km", avgTime: "5.1 hrs", frequency: "Weekends", status: "Inactive" },
];

const vehicles = [
  { id: "TRK-001", type: "Large Truck", capacity: 500, driver: "John Smith", status: "Active", location: "Downtown", fuel: 75, maintenance: "Good" },
  { id: "TRK-002", type: "Medium Truck", capacity: 350, driver: "Sarah Johnson", status: "Active", location: "Industrial Zone", fuel: 60, maintenance: "Good" },
  { id: "TRK-003", type: "Small Truck", capacity: 250, driver: "Mike Wilson", status: "Maintenance", location: "Depot", fuel: 90, maintenance: "Service Due" },
  { id: "TRK-004", type: "Large Truck", capacity: 500, driver: "Emma Davis", status: "Active", location: "Business Park", fuel: 45, maintenance: "Good" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TransportDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCollection, setSelectedCollection] = useState(null);

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
              <h2 className="text-xl font-bold">2,450</h2>
              <p className="text-sm text-green-600">+15% from yesterday</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Truck className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-500">Active Vehicles</p>
              <h2 className="text-xl font-bold">3/4</h2>
              <p className="text-sm text-blue-600">1 in maintenance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <MapPin className="text-purple-600" size={32} />
            <div>
              <p className="text-gray-500">Routes Completed</p>
              <h2 className="text-xl font-bold">26/30</h2>
              <p className="text-sm text-purple-600">86.7% efficiency</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardContent className="flex items-center space-x-4">
            <Clock className="text-orange-600" size={32} />
            <div>
              <p className="text-gray-500">Avg Collection Time</p>
              <h2 className="text-xl font-bold">3.2 hrs</h2>
              <p className="text-sm text-orange-600">-0.3 hrs from last week</p>
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
            {activeCollections.map(collection => (
              <tr key={collection.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{collection.id}</td>
                <td className="p-3">{collection.location}</td>
                <td className="p-3">{collection.driver}</td>
                <td className="p-3">{collection.vehicle}</td>
                <td className="p-3 font-bold">{collection.bottles}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(collection.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                      {collection.status}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <p className="text-sm">Start: {collection.startTime}</p>
                    <p className="text-sm text-gray-500">ETA: {collection.estimatedCompletion}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${collection.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{collection.progress}%</span>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm"><Navigation size={16} /></Button>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </td>
              </tr>
            ))}
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
            {transportRoutes.map(route => (
              <tr key={route.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{route.id}</td>
                <td className="p-3">{route.name}</td>
                <td className="p-3">{route.locations} stops</td>
                <td className="p-3">{route.distance}</td>
                <td className="p-3">{route.avgTime}</td>
                <td className="p-3">{route.frequency}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
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
            <div key={vehicle.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{vehicle.id} - {vehicle.type}</h3>
                  <p className="text-sm text-gray-500">Driver: {vehicle.driver}</p>
                  <p className="text-sm text-gray-500">Capacity: {vehicle.capacity} bottles</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Current Location</p>
                  <p className="text-sm font-medium">{vehicle.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fuel Level</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${vehicle.fuel > 50 ? 'bg-green-600' : vehicle.fuel > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${vehicle.fuel}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{vehicle.fuel}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs ${vehicle.maintenance === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
                  {vehicle.maintenance}
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
            <span className="text-sm font-medium">92.2%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Distance (Month)</span>
            <span className="text-sm font-medium">2,450 km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fuel Consumption</span>
            <span className="text-sm font-medium">485 L</span>
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
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{vehicle.driver}</h3>
                <p className="text-sm text-gray-500">Vehicle: {vehicle.id}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${vehicle.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>
                  {vehicle.status === 'Maintenance' ? 'Off Duty' : 'On Duty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Location</span>
                <span className="text-sm">{vehicle.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Collections Today</span>
                <span className="text-sm font-medium">
                  {vehicle.status === 'Active' ? Math.floor(Math.random() * 5) + 1 : 0}
                </span>
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
