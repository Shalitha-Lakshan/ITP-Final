import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  Search, Filter, Download, Eye, Edit, Trash2, RotateCcw,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  UserCheck, UserX, Star, Calendar, Phone, Mail, MapPin
} from 'lucide-react';

const UserManagementTable = ({ 
  users = [], 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword, 
  onViewProfile,
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const usersPerPage = 10;

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle different data types
      if (sortField === 'createdDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return sortedUsers.slice(startIndex, startIndex + usersPerPage);
  }, [sortedUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ArrowUp size={14} className="text-blue-600" /> : 
      <ArrowDown size={14} className="text-blue-600" />;
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    switch (action) {
      case 'activate':
        selectedUsers.forEach(userId => onToggleStatus(userId, 'Active'));
        break;
      case 'deactivate':
        selectedUsers.forEach(userId => onToggleStatus(userId, 'Inactive'));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          selectedUsers.forEach(userId => onDelete(userId));
        }
        break;
    }
    setSelectedUsers([]);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (role) {
      case 'Collector':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Customer':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        
        {/* Export Button */}
        <Button
          onClick={() => onExport(filteredUsers)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download size={16} className="mr-2" />
          Export Users
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Roles</option>
                <option value="Collector">Collector</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleBulkAction('activate')}
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                >
                  <UserCheck size={14} className="mr-1" />
                  Activate
                </Button>
                <Button
                  onClick={() => handleBulkAction('deactivate')}
                  size="sm"
                  variant="outline"
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <UserX size={14} className="mr-1" />
                  Deactivate
                </Button>
                <Button
                  onClick={() => handleBulkAction('delete')}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">ID</th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">Phone</th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Points</th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created</span>
                      {getSortIcon('createdDate')}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900">Last Login</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-900 font-mono">#{user.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={getRoleBadge(user.role)}>{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={getStatusBadge(user.status)}>{user.status}</span>
                    </td>
                    <td className="p-4">
                      {user.role === 'Customer' ? (
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-sm font-medium">{user.points || 0}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(user.createdDate)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{formatDate(user.lastLogin)}</td>
                    <td className="p-4">
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => onViewProfile(user)}
                          size="sm"
                          variant="outline"
                          className="p-1"
                          title="View Profile"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          onClick={() => onEdit(user)}
                          size="sm"
                          variant="outline"
                          className="p-1"
                          title="Edit User"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => onToggleStatus(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                          size="sm"
                          variant="outline"
                          className={`p-1 ${user.status === 'Active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
                          title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                        </Button>
                        <Button
                          onClick={() => onResetPassword(user.id)}
                          size="sm"
                          variant="outline"
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Reset Password"
                        >
                          <RotateCcw size={14} />
                        </Button>
                        <Button
                          onClick={() => onDelete(user.id)}
                          size="sm"
                          variant="outline"
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({sortedUsers.length} total users)
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        size="sm"
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementTable;
