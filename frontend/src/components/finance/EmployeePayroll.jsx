// src/components/finance/EmployeePayroll.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  Users, Calculator, FileText, Download, Plus, Search, Edit, Trash2,
  DollarSign, Clock, Calendar, Settings, Eye, CheckCircle, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

// Sri Lankan Payroll Configuration (configurable rates)
const PAYROLL_CONFIG = {
  EMPLOYEE_EPF_RATE: 0.08,    // 8% deduction from employee
  EMPLOYER_EPF_RATE: 0.12,    // 12% employer expense
  EMPLOYER_ETF_RATE: 0.03,    // 3% employer expense
  OVERTIME_MULTIPLIER: 1.5,   // 1.5x hourly rate
  WORKING_DAYS_PER_MONTH: 26,
  WORKING_HOURS_PER_DAY: 8
};

// Mock data removed - to be replaced with API calls
const employees = [];
const payrollRuns = [];

export default function EmployeePayroll() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollConfig, setPayrollConfig] = useState(PAYROLL_CONFIG);
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "overview", name: "Payroll Overview", icon: <DollarSign size={20} /> },
    { id: "employees", name: "Employee Management", icon: <Users size={20} /> },
    { id: "calculations", name: "Payroll Calculations", icon: <Calculator size={20} /> },
    { id: "payslips", name: "Payslips", icon: <FileText size={20} /> },
    { id: "reports", name: "Payroll Reports", icon: <BarChart size={20} /> },
    { id: "settings", name: "Configuration", icon: <Settings size={20} /> }
  ];

  // Calculate payroll for an employee
  const calculatePayroll = (employee) => {
    const { basicSalary, overtimeHours } = employee;
    const { EMPLOYEE_EPF_RATE, EMPLOYER_EPF_RATE, EMPLOYER_ETF_RATE, OVERTIME_MULTIPLIER, WORKING_DAYS_PER_MONTH, WORKING_HOURS_PER_DAY } = payrollConfig;
    
    // Calculate hourly rate
    const hourlyRate = basicSalary / (WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY);
    
    // Calculate overtime pay
    const overtimePay = overtimeHours * hourlyRate * OVERTIME_MULTIPLIER;
    
    // Calculate gross salary
    const grossSalary = basicSalary + overtimePay;
    
    // Calculate deductions
    const employeeEPF = grossSalary * EMPLOYEE_EPF_RATE;
    
    // Calculate employer contributions
    const employerEPF = grossSalary * EMPLOYER_EPF_RATE;
    const employerETF = grossSalary * EMPLOYER_ETF_RATE;
    
    // Calculate net salary
    const netSalary = grossSalary - employeeEPF;
    
    return {
      basicSalary,
      overtimeHours,
      overtimePay,
      grossSalary,
      employeeEPF,
      employerEPF,
      employerETF,
      netSalary,
      hourlyRate
    };
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber.includes(searchTerm) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Employees</p>
                <p className="text-3xl font-bold text-blue-900">{employees.length}</p>
                <p className="text-sm text-blue-600">Active employees</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Monthly Payroll</p>
                <p className="text-3xl font-bold text-green-900">LKR 3.75M</p>
                <p className="text-sm text-green-600">Current month</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">EPF Contributions</p>
                <p className="text-3xl font-bold text-purple-900">LKR 750K</p>
                <p className="text-sm text-purple-600">Employee + Employer</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                <Calculator className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Overtime Hours</p>
                <p className="text-3xl font-bold text-orange-900">156</p>
                <p className="text-sm text-orange-600">This month</p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Payroll Runs</h3>
            <Button className="bg-green-600 text-white">
              <Plus size={16} className="mr-2" />
              New Payroll Run
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 font-semibold">Run ID</th>
                  <th className="p-3 font-semibold">Month</th>
                  <th className="p-3 font-semibold">Employees</th>
                  <th className="p-3 font-semibold">Gross Pay</th>
                  <th className="p-3 font-semibold">Deductions</th>
                  <th className="p-3 font-semibold">Net Pay</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.map(run => (
                  <tr key={run.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{run.id}</td>
                    <td className="p-3">{run.month}</td>
                    <td className="p-3">{run.totalEmployees}</td>
                    <td className="p-3">LKR {run.totalGrossPay.toLocaleString()}</td>
                    <td className="p-3">LKR {run.totalDeductions.toLocaleString()}</td>
                    <td className="p-3">LKR {run.totalNetPay.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        {run.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                        <Button variant="ghost" size="sm"><Download size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      {/* Search and Add Employee */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-blue-600 text-white">
          <Plus size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employee List */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 font-semibold">Employee #</th>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Position</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Basic Salary</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{employee.employeeNumber}</td>
                    <td className="p-3">{employee.name}</td>
                    <td className="p-3">{employee.position}</td>
                    <td className="p-3">{employee.department}</td>
                    <td className="p-3">LKR {employee.basicSalary.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <Calculator size={16} />
                        </Button>
                        <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                        <Button variant="ghost" size="sm"><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalculations = () => (
    <div className="space-y-6">
      {selectedEmployee ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Employee Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee Number:</span>
                  <span className="font-medium">{selectedEmployee.employeeNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedEmployee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{selectedEmployee.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{selectedEmployee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-medium">LKR {selectedEmployee.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overtime Hours:</span>
                  <span className="font-medium">{selectedEmployee.overtimeHours} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Calculations */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payroll Calculations</h3>
              {(() => {
                const calc = calculatePayroll(selectedEmployee);
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly Rate:</span>
                      <span className="font-medium">LKR {calc.hourlyRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-medium">LKR {calc.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overtime Pay:</span>
                      <span className="font-medium">LKR {calc.overtimePay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-semibold">Gross Salary:</span>
                      <span className="font-bold">LKR {calc.grossSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Employee EPF (8%):</span>
                      <span>-LKR {calc.employeeEPF.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-green-600 font-semibold">Net Salary:</span>
                      <span className="font-bold text-green-600">LKR {calc.netSalary.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Employer Contributions:</h4>
                      <div className="flex justify-between text-blue-600">
                        <span>Employer EPF (12%):</span>
                        <span>LKR {calc.employerEPF.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Employer ETF (3%):</span>
                        <span>LKR {calc.employerETF.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Select an Employee</h3>
            <p className="text-gray-500">Choose an employee from the Employee Management tab to view payroll calculations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPayslips = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Generate Payslips</h3>
          <div className="flex space-x-2">
            <Button className="bg-blue-600 text-white">
              <FileText size={16} className="mr-2" />
              Generate All
            </Button>
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        <div className="text-center py-12">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Payslip Generation</h3>
          <p className="text-gray-500">Generate and download payslips for employees after processing payroll.</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payroll Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payrollRuns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalGrossPay" fill="#3B82F6" name="Gross Pay" />
              <Bar dataKey="totalNetPay" fill="#10B981" name="Net Pay" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">Payroll Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee EPF Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={payrollConfig.EMPLOYEE_EPF_RATE * 100}
                onChange={(e) => setPayrollConfig({
                  ...payrollConfig,
                  EMPLOYEE_EPF_RATE: parseFloat(e.target.value) / 100
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer EPF Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={payrollConfig.EMPLOYER_EPF_RATE * 100}
                onChange={(e) => setPayrollConfig({
                  ...payrollConfig,
                  EMPLOYER_EPF_RATE: parseFloat(e.target.value) / 100
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer ETF Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={payrollConfig.EMPLOYER_ETF_RATE * 100}
                onChange={(e) => setPayrollConfig({
                  ...payrollConfig,
                  EMPLOYER_ETF_RATE: parseFloat(e.target.value) / 100
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overtime Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                value={payrollConfig.OVERTIME_MULTIPLIER}
                onChange={(e) => setPayrollConfig({
                  ...payrollConfig,
                  OVERTIME_MULTIPLIER: parseFloat(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button className="bg-green-600 text-white">
            <CheckCircle size={16} className="mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "employees": return renderEmployees();
      case "calculations": return renderCalculations();
      case "payslips": return renderPayslips();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white border-b rounded-lg">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
