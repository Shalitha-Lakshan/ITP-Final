import React, { useState } from "react";
import {
  UserCircleIcon,
  PencilIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";

export default function InventoryProfile() {
  const navigate = useNavigate();

  // Mock user profile (replace with backend API call later)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@ecorecycle.com",
    role: "Inventory Manager",
    joined: "2024-03-12",
    profilePic: "", // ✅ will store uploaded image URL
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  const handleSave = () => {
    setProfile(formData);
    setEditing(false);
    alert("Profile updated successfully!");
  };

  const handlePasswordChange = () => {
    if (password.newPass !== password.confirmPass) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setPassword({ current: "", newPass: "", confirmPass: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear auth token
    navigate("/"); // redirect to homepage
  };

  // ✅ Handle profile picture upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profilePic: imgUrl });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CubeIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inventory Hub</h2>
              <p className="text-sm text-gray-500">User Profile</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            to="/inventory/overview"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <CubeIcon className="w-5 h-5" />
            <span className="font-medium">Inventory Overview</span>
          </Link>
          <Link
            to="/inventory/stock"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </Link>
          <Link
            to="/inventory/requests"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Production Requests</span>
          </Link>
          <Link
            to="/inventory/deliveries"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span className="font-medium">Delivery Records</span>
          </Link>
          <Link
            to="/inventory/analytics"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link
            to="/inventory/materials"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <Squares2X2Icon className="w-5 h-5" />
            <span className="font-medium">Raw Materials</span>
          </Link>
          <Link
            to="/inventory/reports"
            className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-green-600"
            />
          ) : (
            <UserCircleIcon className="w-24 h-24 text-green-600" />
          )}
          <h2 className="text-2xl font-bold mt-2">{profile.name}</h2>
          <p className="text-gray-500">{profile.role}</p>
        </div>

        {/* Profile Info */}
        {!editing ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold text-gray-600">Email:</span>
              <span>{profile.email}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold text-gray-600">Role:</span>
              <span>{profile.role}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold text-gray-600">Joined:</span>
              <span>{profile.joined}</span>
            </div>
            <button
              onClick={() => {
                setFormData(profile); // load current data
                setEditing(true);
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              <PencilIcon className="w-5 h-5" /> Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              {formData.profilePic ? (
                <img
                  src={formData.profilePic}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-500 mb-2"
                />
              ) : (
                <UserCircleIcon className="w-24 h-24 text-green-500 mb-2" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={handleSave}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditing(false)}
              className="w-full mt-2 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Password Change */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-gray-600" /> Change Password
          </h3>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={password.current}
              onChange={(e) =>
                setPassword({ ...password, current: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              value={password.newPass}
              onChange={(e) =>
                setPassword({ ...password, newPass: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={password.confirmPass}
              onChange={(e) =>
                setPassword({ ...password, confirmPass: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
            />
            <button
              onClick={handlePasswordChange}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
