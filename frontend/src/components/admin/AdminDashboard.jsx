// src/components/admin/AdminDashboard.jsx
import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  Shield, Users, UserCheck, Activity, Settings, Search, Filter, Download,
  Plus, Edit, Trash2, Eye, AlertTriangle, CheckCircle, Clock, XCircle,
  Calendar, Mail, Phone, MapPin, Briefcase, Award
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import LogoutButton from "../common/LogoutButton";

// Mock Data
const auditLogs = [
  { id: 1, timestamp: "2025-09-01 14:30:25", user: "john.doe@company.com", action: "User Login", resource: "Authentication", status: "Success", ip: "192.168.1.100" },
  { id: 2, timestamp: "2025-09-01 14:25:10", user: "admin@company.com", action: "User Created", resource: "User Management", status: "Success", ip: "192.168.1.101" },
  { id: 3, timestamp: "2025-09-01 14:20:45", user: "jane.smith@company.com", action: "Password Reset", resource: "Authentication", status: "Failed", ip: "192.168.1.102" },
  { id: 4, timestamp: "2025-09-01 14:15:30", user: "mike.wilson@company.com", action: "Data Export", resource: "Reports", status: "Success", ip: "192.168.1.103" },
  { id: 5, timestamp: "2025-09-01 14:10:15", user: "admin@company.com", action: "Staff Updated", resource: "Staff Management", status: "Success", ip: "192.168.1.101" },
];

const users = [
  { id: 1, name: "John Doe", email: "john.doe@company.com", role: "Finance Manager", status: "Active", lastLogin: "2025-09-01 14:30", department: "Finance" },
  { id: 2, name: "Jane Smith", email: "jane.smith@company.com", role: "Inventory Manager", status: "Active", lastLogin: "2025-09-01 13:45", department: "Inventory" },
  { id: 3, name: "Mike Wilson", email: "mike.wilson@company.com", role: "Sales Manager", status: "Inactive", lastLogin: "2025-08-30 16:20", department: "Sales" },
  { id: 4, name: "Sarah Johnson", email: "sarah.johnson@company.com", role: "Production Manager", status: "Active", lastLogin: "2025-09-01 12:15", department: "Production" },
  { id: 5, name: "David Brown", email: "david.brown@company.com", role: "Transport Manager", status: "Pending", lastLogin: "Never", department: "Transport" },
];

const staff = [
  { id: 1, name: "Alice Cooper", email: "alice.cooper@company.com", position: "Senior Accountant", department: "Finance", salary: 75000, hireDate: "2023-01-15", status: "Active", phone: "+1-555-0101" },
  { id: 2, name: "Bob Martinez", email: "bob.martinez@company.com", position: "Warehouse Supervisor", department: "Inventory", salary: 55000, hireDate: "2023-03-20", status: "Active", phone: "+1-555-0102" },
  { id: 3, name: "Carol Davis", email: "carol.davis@company.com", position: "Sales Representative", department: "Sales", salary: 45000, hireDate: "2023-06-10", status: "On Leave", phone: "+1-555-0103" },
  { id: 4, name: "Daniel Lee", email: "daniel.lee@company.com", position: "Production Operator", department: "Production", salary: 40000, hireDate: "2023-08-05", status: "Active", phone: "+1-555-0104" },
  { id: 5, name: "Eva Rodriguez", email: "eva.rodriguez@company.com", position: "Driver", department: "Transport", salary: 38000, hireDate: "2023-09-12", status: "Active", phone: "+1-555-0105" },
];

const systemStats = [
  { name: "Total Users", value: 156, change: "+12", color: "#3B82F6" },
  { name: "Active Sessions", value: 89, change: "+5", color: "#10B981" },
  { name: "Failed Logins", value: 23, change: "-8", color: "#EF4444" },
  { name: "System Uptime", value: "99.9%", change: "+0.1%", color: "#8B5CF6" },
];

const activityData = [
  { hour: "00:00", logins: 5, actions: 12 },
  { hour: "04:00", logins: 8, actions: 18 },
  { hour: "08:00", logins: 45, actions: 120 },
  { hour: "12:00", logins: 67, actions: 180 },
  { hour: "16:00", logins: 52, actions: 145 },
  { hour: "20:00", logins: 23, actions: 65 },
];

const departmentData = [
  { name: "Finance", users: 25, color: "#3B82F6" },
  { name: "Inventory", users: 32, color: "#10B981" },
  { name: "Sales", users: 28, color: "#F59E0B" },
  { name: "Production", users: 45, color: "#EF4444" },
  { name: "Transport", users: 18, color: "#8B5CF6" },
  { name: "Admin", users: 8, color: "#6B7280" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const tabs = [
    { id: "overview", name: "Admin Overview", icon: <Shield size={20} /> },
    { id: "audit", name: "Audit Logs", icon: <Activity size={20} /> },
    { id: "users", name: "User Management", icon: <Users size={20} /> },
    { id: "staff", name: "Staff Management", icon: <UserCheck size={20} /> },
    { id: "settings", name: "System Settings", icon: <Settings size={20} /> },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                  <Shield className="text-white" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Activity (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={3} name="Logins" />
                <Line type="monotone" dataKey="actions" stroke="#10B981" strokeWidth={3} name="Actions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Users by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="users"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent System Activity</h3>
          <div className="space-y-4">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-600">{log.user} • {log.timestamp}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditLogs = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Audit Logs</h3>
              <p className="text-sm text-gray-600">System activity and security logs</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tl-xl">Timestamp</th>
                <th className="text-left p-4 font-semibold text-gray-900">User</th>
                <th className="text-left p-4 font-semibold text-gray-900">Action</th>
                <th className="text-left p-4 font-semibold text-gray-900">Resource</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tr-xl">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4 font-mono text-sm text-gray-700">{log.timestamp}</td>
                  <td className="p-4 text-gray-900">{log.user}</td>
                  <td className="p-4 font-medium text-gray-900">{log.action}</td>
                  <td className="p-4 text-gray-700">{log.resource}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-600">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderUserManagement = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">Manage system users and permissions</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Search size={16} className="mr-2" />
              Search
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tl-xl">Name</th>
                <th className="text-left p-4 font-semibold text-gray-900">Email</th>
                <th className="text-left p-4 font-semibold text-gray-900">Role</th>
                <th className="text-left p-4 font-semibold text-gray-900">Department</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900">Last Login</th>
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4 font-medium text-gray-900">{user.name}</td>
                  <td className="p-4 text-gray-700">{user.email}</td>
                  <td className="p-4 text-gray-700">{user.role}</td>
                  <td className="p-4 text-gray-700">{user.department}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      user.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderStaffManagement = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Staff Management</h3>
              <p className="text-sm text-gray-600">Manage employee records and information</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Search size={16} className="mr-2" />
              Search
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus size={16} className="mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tl-xl">Name</th>
                <th className="text-left p-4 font-semibold text-gray-900">Position</th>
                <th className="text-left p-4 font-semibold text-gray-900">Department</th>
                <th className="text-left p-4 font-semibold text-gray-900">Salary</th>
                <th className="text-left p-4 font-semibold text-gray-900">Hire Date</th>
                <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                <th className="text-left p-4 font-semibold text-gray-900 rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{member.position}</td>
                  <td className="p-4 text-gray-700">{member.department}</td>
                  <td className="p-4 font-semibold text-gray-900">${member.salary.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600">{member.hireDate}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' :
                      member.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system preferences and security</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Security Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Two-Factor Authentication</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Password Policy</span>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Session Timeout</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">System Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Email Notifications</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Backup Schedule</span>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">System Maintenance</span>
                  <Button variant="outline" size="sm">Schedule</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "audit":
        return renderAuditLogs();
      case "users":
        return renderUserManagement();
      case "staff":
        return renderStaffManagement();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Hub</h2>
              <p className="text-sm text-gray-500">System Administration</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive system administration and management
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Calendar size={16} className="mr-2" />
                Date Range
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
    </div>
  );
}
