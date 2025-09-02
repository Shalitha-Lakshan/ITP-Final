import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, User, DollarSign, Clock, Calculator } from 'lucide-react';

const EmployeePaymentsManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    basicSalary: '',
    epfRate: 8, // 8% EPF
    etfRate: 3, // 3% ETF
    overtimeHours: 0,
    overtimeRate: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = (employee) => {
    const basicSalary = parseFloat(employee.basicSalary) || 0;
    const overtimeAmount = (parseFloat(employee.overtimeHours) || 0) * (parseFloat(employee.overtimeRate) || 0);
    const grossSalary = basicSalary + overtimeAmount;
    const epfDeduction = grossSalary * (employee.epfRate / 100);
    const etfDeduction = grossSalary * (employee.etfRate / 100);
    const netSalary = grossSalary - epfDeduction - etfDeduction;

    return {
      basicSalary,
      overtimeAmount,
      grossSalary,
      epfDeduction,
      etfDeduction,
      netSalary
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEmployee 
        ? `http://localhost:5000/api/finance/employees/${editingEmployee._id}`
        : 'http://localhost:5000/api/finance/employees';
      
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchEmployees();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/finance/employees/${employeeId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchEmployees();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      basicSalary: '',
      epfRate: 8,
      etfRate: 3,
      overtimeHours: 0,
      overtimeRate: '',
      month: new Date().toISOString().slice(0, 7)
    });
    setShowAddForm(false);
    setEditingEmployee(null);
  };

  const startEdit = (employee) => {
    setFormData(employee);
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Employee Payments Management</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (LKR)</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EPF Rate (%)</label>
              <input
                type="number"
                value={formData.epfRate}
                onChange={(e) => setFormData({...formData, epfRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ETF Rate (%)</label>
              <input
                type="number"
                value={formData.etfRate}
                onChange={(e) => setFormData({...formData, etfRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
              <input
                type="number"
                value={formData.overtimeHours}
                onChange={(e) => setFormData({...formData, overtimeHours: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate (LKR/hour)</label>
              <input
                type="number"
                value={formData.overtimeRate}
                onChange={(e) => setFormData({...formData, overtimeRate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Basic Salary</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Overtime</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">EPF/ETF</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Net Salary</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const payroll = calculatePayroll(employee);
                return (
                  <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">ID: {employee.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">LKR {payroll.basicSalary.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{employee.overtimeHours}h</p>
                      <p className="text-sm text-gray-500">LKR {payroll.overtimeAmount.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">EPF: LKR {payroll.epfDeduction.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">ETF: LKR {payroll.etfDeduction.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-green-600">LKR {payroll.netSalary.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{employee.month}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(employee)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {employees.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employee records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Salary Expenses Chart */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Salary Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Basic Salaries</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              LKR {employees.reduce((sum, emp) => sum + (parseFloat(emp.basicSalary) || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Total Overtime</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              LKR {employees.reduce((sum, emp) => sum + ((parseFloat(emp.overtimeHours) || 0) * (parseFloat(emp.overtimeRate) || 0)), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Total Deductions</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              LKR {employees.reduce((sum, emp) => {
                const payroll = calculatePayroll(emp);
                return sum + payroll.epfDeduction + payroll.etfDeduction;
              }, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Net Payroll</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              LKR {employees.reduce((sum, emp) => sum + calculatePayroll(emp).netSalary, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePaymentsManagement;
