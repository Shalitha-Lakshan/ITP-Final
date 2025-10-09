import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Search, Users as UsersIcon, X, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    email: '',
    phone: '',
    department: 'Operations',
    position: '',
    employmentType: 'full-time',
    joinDate: new Date().toISOString().split('T')[0],
    basicSalary: '',
    bankName: '',
    accountNumber: '',
    status: 'active'

  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch employees from API with search
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/employees';
      
      if (searchTerm.trim()) {
        // Add search query that matches from start of name
        url += `?search=${encodeURIComponent(searchTerm.trim())}&searchType=startsWith`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input with validation
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Check if input looks like an email (contains @)
    const isEmailSearch = value.includes('@');
    
    if (isEmailSearch) {
      // Email validation regex (basic format check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // Additional email validation for domain and TLD
      const [localPart, domain] = value.split('@');
      if (localPart.length > 64 || domain.length > 253) {
        toast.error('Email address is too long');
        return;
      }
      
      // Check TLD (top-level domain) has at least 2 characters
      const tld = domain.split('.').pop();
      if (tld.length < 2) {
        toast.error('Please enter a valid email domain');
        return;
      }
    } else {
      // For non-email searches, allow alphanumeric and common characters
      const searchRegex = /^[a-zA-Z0-9\s\-\'\.]*$/;
      if (value && !searchRegex.test(value)) {
        toast.error('Please use only letters, numbers, spaces, hyphens, and apostrophes');
        return;
      }
    }
    
    // Limit search term length
    if (value.length > 50) {
      toast.error('Search term cannot exceed 50 characters');
      return;
    }
    
    setSearchTerm(value);
  };

  // Debounce search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchEmployees();
      return;
    }
    
    const timerId = setTimeout(() => {
      fetchEmployees();
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle nested objects (like emergencyContact)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      let processedValue = value;
      
      // Apply restrictions based on field type
      switch (name) {
        case 'fullName':
          // Only allow letters, spaces, and dots
          processedValue = value.replace(/[^A-Za-z\s.]/g, '');
          // Limit to 100 characters
          if (processedValue.length > 100) {
            processedValue = processedValue.substring(0, 100);
          }
          break;
          
        case 'email':
          // No special restrictions, but limit length
          if (value.length > 100) {
            processedValue = value.substring(0, 100);
          }
          break;
          
        case 'phone':
        case 'emergencyContact.phone':
          // Only allow digits and format as user types
          let digits = value.replace(/\D/g, '');
          // Limit to 10 digits (Sri Lankan phone numbers)
          if (digits.length > 10) {
            digits = digits.substring(0, 10);
          }
          // Format as 071-234-5678
          if (digits.length > 6) {
            processedValue = `${digits.substring(0, 3)}-${digits.substring(3, 6)}-${digits.substring(6)}`;
          } else if (digits.length > 3) {
            processedValue = `${digits.substring(0, 3)}-${digits.substring(3)}`;
          } else {
            processedValue = digits;
          }
          break;
          
        case 'position':
          // Only allow letters and spaces
          processedValue = value.replace(/[^A-Za-z\s]/g, '');
          // Limit to 50 characters
          if (processedValue.length > 50) {
            processedValue = processedValue.substring(0, 50);
          }
          break;
          
        case 'basicSalary':
          // Allow only numbers and up to 2 decimal places
          processedValue = value.replace(/[^0-9.]/g, '')
            .replace(/(\..*?)\./g, '$1') // Remove extra decimal points
            .replace(/^(\d{1,9})(\.\d{0,2})?.*$/, '$1$2'); // Limit to 2 decimal places
          // Ensure it's within the allowed range
          const numValue = parseFloat(processedValue) || 0;
          if (numValue > 1000000) {
            processedValue = '1000000';
          }
          break;
          
        case 'bankName':
          // Only allow letters and spaces
          processedValue = value.replace(/[^A-Za-z\s]/g, '');
          // Limit to 50 characters
          if (processedValue.length > 50) {
            processedValue = processedValue.substring(0, 50);
          }
          break;
          
        case 'accountNumber':
          // Only allow digits
          processedValue = value.replace(/\D/g, '');
          // Limit to 12 digits
          if (processedValue.length > 12) {
            processedValue = processedValue.substring(0, 12);
          }
          break;
          
        default:
          processedValue = value;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
    
    // Clear error when user starts typing
    const errorKey = name.includes('.') ? name : name.split('.')[0];
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const sriLankanPhoneRegex = /^0[1-9][0-9]{8}$/; // Matches 10 digits starting with 07
    const nameRegex = /^[A-Za-z\s.]{3,100}$/; // Only letters, spaces, and dots, 3-100 chars
    const positionRegex = /^[A-Za-z\s]{2,50}$/; // Only letters and spaces, 2-50 chars
    const bankNameRegex = /^[A-Za-z\s]{1,50}$/; // Only letters and spaces, max 50 chars
    const accountNumberRegex = /^\d{10,12}$/; // 10-12 digits only
    const today = new Date();
    const joinDate = new Date(formData.joinDate);
    
    // Full Name Validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (!nameRegex.test(formData.fullName.trim())) {
      errors.fullName = 'Name must contain only letters, spaces, and dots (3-100 characters)';
    }
    
    // Email Validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone Number Validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const digitsOnly = formData.phone.replace(/[^0-9]/g, '');
      if (!sriLankanPhoneRegex.test(digitsOnly)) {
        errors.phone = 'Please enter a valid Sri Lankan phone number (10 digits, starting with 07)';
      }
    }
    
    // Position Validation
    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    } else if (!positionRegex.test(formData.position.trim())) {
      errors.position = 'Position must contain only letters and spaces (2-50 characters)';
    }
    
    // Join Date Validation
    const foundingYear = 2024; // Company founding year
    const minJoinDate = new Date(foundingYear, 0, 1); // January 1st of founding year
    
    if (joinDate > today) {
      errors.joinDate = 'Join date cannot be in the future';
    } else if (joinDate < minJoinDate) {
      errors.joinDate = `Join date cannot be before company founding year (${foundingYear})`;
    }
    
    // Basic Salary Validation
    if (!formData.basicSalary) {
      errors.basicSalary = 'Basic salary is required';
    } else {
      const salary = parseFloat(formData.basicSalary);
      if (isNaN(salary) || salary <= 0) {
        errors.basicSalary = 'Please enter a valid salary amount';
      } else if (salary < 20000) {
        errors.basicSalary = 'Salary must be at least Rs. 20,000';
      } else if (salary > 1000000) {
        errors.basicSalary = 'Salary cannot exceed Rs. 1,000,000';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.basicSalary)) {
        errors.basicSalary = 'Salary can have maximum 2 decimal places';
      }
    }
    
    // Bank Name Validation
    if (formData.bankName && !bankNameRegex.test(formData.bankName.trim())) {
      errors.bankName = 'Bank name can only contain letters and spaces (max 50 characters)';
    }
    
    // Account Number Validation
    if (formData.accountNumber) {
      const accountNumber = formData.accountNumber.replace(/[^0-9]/g, '');
      if (!accountNumberRegex.test(accountNumber)) {
        errors.accountNumber = 'Account number must be 10-12 digits';
      }
    }
    
    // Emergency contact validation if any field is filled
    if (formData.emergencyContact?.name || formData.emergencyContact?.phone) {
      if (!formData.emergencyContact?.name?.trim()) {
        errors['emergencyContact.name'] = 'Emergency contact name is required';
      }
      if (!formData.emergencyContact?.phone?.trim()) {
        errors['emergencyContact.phone'] = 'Emergency contact phone is required';
      } else {
        const emergencyDigits = formData.emergencyContact.phone.replace(/[^0-9]/g, '');
        if (!sriLankanPhoneRegex.test(emergencyDigits)) {
          errors['emergencyContact.phone'] = 'Please enter a valid Sri Lankan phone number (10 digits, starting with 07)';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const url = editingEmployee 
        ? `http://localhost:5000/api/employees/${editingEmployee._id}`
        : 'http://localhost:5000/api/employees';
      
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Employee ${editingEmployee ? 'updated' : 'added'} successfully`);
        setShowAddModal(false);
        fetchEmployees();
        resetForm();
      } else {
        throw new Error(data.message || `Failed to ${editingEmployee ? 'update' : 'add'} employee`);
      }
    } catch (error) {
      console.error(`Error ${editingEmployee ? 'updating' : 'adding'} employee:`, error);
      
      // Handle duplicate entry errors
      if (error.message && (error.message.includes('duplicate') || error.message.includes('already exists'))) {
        if (error.message.includes('email') || error.message.includes('Email')) {
          alert('❌ Error: This email is already in use. Please use a different email address.');
          setFormErrors(prev => ({ ...prev, email: 'This email is already in use' }));
        } else if (error.message.includes('employeeId') || error.message.includes('ID')) {
          alert('❌ Error: This employee ID is already in use. Please use a different ID.');
          setFormErrors(prev => ({ ...prev, employeeId: 'This ID is already in use' }));
        } else if (error.message.includes('accountNumber') || error.message.includes('bank account')) {
          alert('❌ Error: This bank account number is already in use. Please verify the account number.');
          setFormErrors(prev => ({ ...prev, accountNumber: 'This account number is already in use' }));
        } else {
          alert('❌ Error: This record conflicts with an existing entry. Please check your input.');
        }
      } else {
        // Handle other errors
        toast.error(error.message || `Failed to ${editingEmployee ? 'update' : 'add'} employee`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      email: '',
      phone: '',
      department: 'Operations',
      position: '',
      employmentType: 'full-time',
      joinDate: new Date().toISOString().split('T')[0],
      basicSalary: '',
      bankName: '',
      accountNumber: '',
      status: 'active',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    setFormErrors({});
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || 'IT',
      position: employee.position || '',
      employmentType: employee.employmentType || 'full-time',
      joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      basicSalary: employee.basicSalary || '',
      bankName: employee.bankName || '',
      accountNumber: employee.accountNumber || '',
      status: employee.status || 'active',
      emergencyContact: employee.emergencyContact || {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast.success('Employee deleted successfully');
          fetchEmployees();
        } else {
          throw new Error('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const isEmailSearch = searchLower.includes('@');
    
    if (isEmailSearch) {
      // For email searches, match from the start of the email
      return employee.email && employee.email.toLowerCase().startsWith(searchLower);
    } else {
      // For other searches, match from the start of the field
      return (
        (employee.fullName && employee.fullName.toLowerCase().startsWith(searchLower)) ||
        (employee.employeeId && employee.employeeId.toLowerCase().startsWith(searchLower)) ||
        (employee.email && employee.email.toLowerCase().startsWith(searchLower))
      );
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Employee Management</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Employee
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {employees.length === 0 ? (
              <div className="text-center py-12 px-4">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search or ' : 'Get started by '}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    adding a new employee
                  </button>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position / Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                              <div className="text-xs text-gray-500">ID: {employee.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                          <div className="text-sm text-gray-500 capitalize">{employee.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                          <div className="text-sm text-gray-500">{employee.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(employee.basicSalary || 0)}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {employee.employmentType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'active' ? 'bg-green-100 text-green-800' :
                            employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                              title="Delete"
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span>{editingEmployee ? 'Updating employee...' : 'Adding employee...'}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.fullName ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.phone ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Production">Production</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${formErrors.position ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.position && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    min="2024-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full p-2 border rounded-md ${formErrors.basicSalary ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.basicSalary && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.basicSalary}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      {editingEmployee ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingEmployee ? 'Update Employee' : 'Save Employee'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;