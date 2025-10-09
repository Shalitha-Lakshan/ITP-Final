import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Filter, Download as DownloadIcon, Search, 
  CheckCircle, Clock, XCircle, DollarSign, X 
} from 'lucide-react';
// Import jsPDF and autoTable
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExpenseForm from './ExpenseForm';
import ExpenseSummary from './ExpenseSummary';

const API_BASE_URL = 'http://localhost:5000/api';

// Format currency helper function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const ExpensesDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  // Show notification and auto-hide after 3 seconds
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };
  
  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses based on search and filters
  const filteredExpenses = expenses.filter(expense => {
    const searchLower = searchTerm.toLowerCase().trim();
    const descriptionLower = expense.description.toLowerCase();
    
    // Match if description starts with search term (case-insensitive)
    const matchesSearch = searchTerm === '' || 
      descriptionLower.startsWith(searchLower);
      
    const matchesStatus = filters.status === 'all' || expense.status === filters.status;
    const matchesCategory = filters.category === 'all' || expense.category === filters.category;
    const matchesDate = (!filters.startDate || expense.date >= filters.startDate) && 
                       (!filters.endDate || expense.date <= filters.endDate);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // State for summary data
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0
  });

  // Fetch summary data from the backend
  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense summary');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setSummary({
          total: data.data.total || 0,
          paid: data.data.paid || 0,
          pending: data.data.pending || 0,
          failed: data.data.failed || 0
        });
      }
    } catch (err) {
      console.error('Error fetching expense summary:', err);
    }
  };

  // Fetch summary data when component mounts and when expenses change
  useEffect(() => {
    fetchSummary();
  }, [expenses]);

  // Handle CRUD operations
  const handleAddExpense = async (expense) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(expense)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData.errors 
          ? Array.isArray(responseData.errors) 
            ? responseData.errors.join('; ')
            : JSON.stringify(responseData.errors)
          : responseData.message || 'Failed to add expense';
        throw new Error(errorMessage);
      }
      
      setError(null);
      await fetchExpenses();
      setIsFormOpen(false);
      showNotification('Expense added successfully!', 'success');
    } catch (err) {
      console.error('Error adding expense:', err);
      const errorMessage = err.message || 'Failed to add expense. Please check the form and try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleUpdateExpense = async (updatedExpense) => {
    try {
      // Validate expense data and ID
      if (!updatedExpense) {
        throw new Error('No expense data provided');
      }
      
      const expenseId = updatedExpense._id;
      if (!expenseId) {
        throw new Error('Expense ID is required for update');
      }
      
      // Create a clean update payload with proper data types
      const { _id, ...expenseData } = updatedExpense;
      const updatePayload = {
        description: String(expenseData.description || '').trim(),
        amount: parseFloat(expenseData.amount || 0),
        category: String(expenseData.category || ''),
        date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
        paymentMethod: String(expenseData.paymentMethod || 'Credit Card'),
        status: String(expenseData.status || 'pending'),
        notes: expenseData.notes ? String(expenseData.notes).trim() : '',
      };
      
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatePayload)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        let errorMessage = 'Failed to update expense';
        
        if (responseData.errors) {
          errorMessage = Array.isArray(responseData.errors) 
            ? responseData.join('\n')
            : JSON.stringify(responseData.errors);
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update expense');
      }
      
      setError(null);
      setCurrentExpense(null);
      setIsFormOpen(false);
      await fetchExpenses();
      showNotification('Expense updated successfully!', 'success');
      
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = `Update failed: ${err.message}`;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!id) {
      const errorMessage = 'Cannot delete: No expense ID provided';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData.message || 
          (responseData.errors ? JSON.stringify(responseData.errors) : 'Failed to delete expense')
        );
      }
      
      setError(null);
      await fetchExpenses();
      showNotification('Expense deleted successfully!', 'success');
      
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMessage = `Delete failed: ${err.message}`;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (expense) => {
    // Make sure we're passing a copy of the expense with _id preserved
    setCurrentExpense({
      ...expense,
      _id: expense._id // Ensure _id is explicitly included
    });
    setIsFormOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    const statusIcons = {
      paid: <CheckCircle className="w-4 h-4 mr-1" />,
      pending: <Clock className="w-4 h-4 mr-1" />,
      failed: <XCircle className="w-4 h-4 mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Generate and download PDF
  const generateAndDownloadPDF = async () => {
    try {
      if (expenses.length === 0) {
        showNotification('No expenses to download', 'info');
        return;
      }

      // Dynamically import jsPDF and its plugins
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Create a new PDF document
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Add title and date
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text('Expenses Report', 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${currentDate}`, 14, 28);

      // Prepare table data
      const headers = [
        'Description',
        'Category',
        'Date',
        'Payment Method',
        'Amount',
        'Status'
      ];

      // Format the data
      const tableData = expenses.map(expense => [
        expense.description || '-',
        expense.category || '-',
        expense.date ? new Date(expense.date).toLocaleDateString() : '-',
        expense.paymentMethod || '-',
        formatCurrency(Number(expense.amount || 0)),
        expense.status ? expense.status.charAt(0).toUpperCase() + expense.status.slice(1) : '-'
      ]);

      // Add the table using the autoTable plugin
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 35, halign: 'left' },
          1: { cellWidth: 25, halign: 'left' },
          2: { cellWidth: 20, halign: 'left' },
          3: { cellWidth: 25, halign: 'left' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'center' }
        },
        margin: { top: 35 },
        didDrawPage: function(data) {
          // Add page number
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(`Page ${pageCount}`, data.settings.margin.left, pageHeight - 10);
        }
      });

      // Add total amount
      const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Expenses: ${formatCurrency(totalAmount)}`, 14, doc.lastAutoTable.finalY + 15);

      // Save the PDF
      doc.save('expenses_report.pdf');
      showNotification('PDF downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification(`Failed to generate PDF: ${error.message}`, 'error');
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : 'bg-green-100 border-l-4 border-green-500'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'error' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                notification.type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4">
              <button
                type="button"
                className="inline-flex text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setNotification({ show: false, message: '', type: '' })}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Dashboard</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateAndDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => {
              setCurrentExpense(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <ExpenseSummary summary={summary} />

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">All Categories</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Meals">Meals</option>
              <option value="Software">Software</option>
              <option value="Marketing">Marketing</option>
              <option value="Travel">Travel</option>
            </select>
            
            <input
              type="date"
              className="block w-full md:w-auto pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="From"
              value={filters.startDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
            
            <input
              type="date"
              className="block w-full md:w-auto pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="To"
              value={filters.endDate}
              min={filters.startDate || ''}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              disabled={!filters.startDate}
            />
            
            <button
              onClick={() => setFilters({
                status: 'all',
                category: 'all',
                startDate: '',
                endDate: ''
              })}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4 inline-block" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No expenses found. Add a new expense to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setCurrentExpense(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="mt-4">
              <ExpenseForm
                expense={currentExpense}
                onSave={currentExpense ? handleUpdateExpense : handleAddExpense}
                onCancel={() => {
                  setIsFormOpen(false);
                  setCurrentExpense(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesDashboard;
