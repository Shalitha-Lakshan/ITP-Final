import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Format currency helper function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

const ExpensesSummaryReport = ({ dateRange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expensesData, setExpensesData] = useState({
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0,
    failedExpenses: 0,
    avgExpense: 0,
    trend: 0,
    expensesByCategory: [],
    recentExpenses: []
  });

  const fetchExpenseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch summary data
      const [summaryResponse, expensesResponse] = await Promise.all([
        axios.get(`${API_URL}/expenses/summary`, {
          params: {
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString()
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        // Fetch recent expenses
        axios.get(`${API_URL}/expenses`, {
          params: {
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString(),
            limit: 5,
            sort: '-date'
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const summary = summaryResponse.data.data || {};
      const recentExpenses = expensesResponse.data.data || [];
      
      // Calculate trend (simple month-over-month comparison for now)
      const previousMonth = new Date(dateRange.from);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const prevMonthEnd = new Date(dateRange.to);
      prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
      
      // In a real app, we would fetch previous period data here
      // For now, we'll use a simple calculation
      const trend = summary.total > 0 ? 5 : 0; // Example trend value

      // Format categories
      const categories = summary.categories || [];
      const formattedCategories = categories.map(cat => ({
        name: cat._id || 'Uncategorized',
        amount: cat.total || 0,
        count: cat.count || 0,
        percentage: summary.total > 0 ? ((cat.total / summary.total) * 100).toFixed(1) : 0
      })).sort((a, b) => b.amount - a.amount);

      // Format recent expenses
      const formattedRecentExpenses = recentExpenses.map(exp => ({
        id: exp._id,
        description: exp.description || 'No description',
        date: exp.date,
        amount: exp.amount || 0,
        category: exp.category || 'Uncategorized',
        status: exp.status || 'pending',
        paymentMethod: exp.paymentMethod || 'N/A'
      }));

      setExpensesData({
        totalExpenses: summary.total || 0,
        paidExpenses: summary.paid || 0,
        pendingExpenses: summary.pending || 0,
        failedExpenses: summary.failed || 0,
        avgExpense: summary.avgExpense || 0,
        trend,
        expensesByCategory: formattedCategories,
        recentExpenses: formattedRecentExpenses
      });
    } catch (error) {
      console.error('Error fetching expense data:', error);
      setError('Failed to load expense data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [dateRange]);

  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = window.location.origin + url;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
  };

  const exportToPDF = async () => {
    try {
      // Show loading state
      const toastId = toast.loading('Generating PDF report...');
      
      // Dynamically import required libraries
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Initialize PDF document
      const doc = new jsPDF();
      
      // Colors
      const colors = {
        primary: [13, 148, 136], // Teal
        secondary: [16, 86, 167], // Blue
        success: [40, 167, 69], // Green
        warning: [255, 193, 7], // Yellow
        danger: [220, 53, 69], // Red
        light: [248, 249, 250], // Light gray
        dark: [33, 37, 41] // Dark gray
      };
      
      // Add header with logo and company info
      const logo = await loadImage('/ecocycle-logo.png');
      if (logo) {
        const logoWidth = 30;
        const logoHeight = (logo.height * logoWidth) / logo.width;
        doc.addImage(logo, 'PNG', 20, 15, logoWidth, logoHeight);
      }
      
      // Company info
      doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...colors.dark);
      doc.text('ECO CYCLE LANKA (PVT) LTD', 60, 25);
      
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100);
      doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', 60, 30);
      doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', 60, 35);
      
      // Report title and date
      doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...colors.primary);
      doc.text('EXPENSES SUMMARY REPORT', 105, 50, { align: 'center' });
      
      doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(100);
      doc.text(
        `Report Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`, 
        105, 
        60,
        { align: 'center' }
      );
      
      // Summary cards
      const summaryData = [
        { 
          title: 'TOTAL EXPENSES', 
          value: expensesData.totalExpenses, 
          color: colors.primary,
          icon: 'dollar'
        },
        { 
          title: 'PAID', 
          value: expensesData.paidExpenses, 
          color: colors.success,
          icon: 'check'
        },
        { 
          title: 'PENDING', 
          value: expensesData.pendingExpenses, 
          color: colors.warning,
          icon: 'clock'
        },
        { 
          title: 'FAILED', 
          value: expensesData.failedExpenses, 
          color: colors.danger,
          icon: 'x'
        }
      ];
      
      // Draw summary cards
      const cardWidth = 42;
      const cardHeight = 25;
      const startY = 75;
      const gap = 10;
      
      summaryData.forEach((card, index) => {
        const x = 15 + (index % 2) * (cardWidth + gap);
        const y = startY + Math.floor(index / 2) * (cardHeight + gap);
        
        // Card background
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
        
        // Card border
        doc.setDrawColor(...card.color);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');
        
        // Card content
        doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(100);
        doc.text(card.title, x + 5, y + 8);
        
        doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...card.color);
        doc.text(
          formatCurrency(card.value), 
          x + 5, 
          y + 16
        );
      });
      
      // Expenses by category table
      const tableStartY = startY + 2 * (cardHeight + gap) + 10;
      
      doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...colors.dark);
      doc.text('EXPENSES BY CATEGORY', 15, tableStartY - 5);
      
      autoTable(doc, {
        startY: tableStartY,
        head: [['Category', 'Amount', 'Transactions', 'Status']],
        body: expensesData.expensesByCategory.map(cat => [
          cat.name || 'Uncategorized',
          { 
            content: formatCurrency(cat.amount).replace('LKR', '').trim(),
            styles: { halign: 'right' }
          },
          cat.count.toString(),
          { 
            content: '',
            styles: { 
              cellWidth: 10,
              fillColor: cat.status === 'active' ? colors.success : colors.warning,
              textColor: [255, 255, 255],
              cellPadding: 1
            }
          }
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 10, halign: 'center' }
        },
        margin: { left: 15, right: 15 }
      });
      
      // Recent transactions table
      doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...colors.dark);
      doc.text('RECENT TRANSACTIONS', 15, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Description', 'Category', 'Amount', 'Status']],
        body: expensesData.recentExpenses.map(expense => ({
          date: format(new Date(expense.date), 'MMM d, yyyy'),
          description: expense.description || 'No description',
          category: expense.category || 'Uncategorized',
          amount: { 
            content: formatCurrency(expense.amount).replace('LKR', '').trim(),
            styles: { halign: 'right' }
          },
          status: {
            content: expense.status?.charAt(0).toUpperCase() + expense.status?.slice(1) || 'Unknown',
            styles: {
              fillColor: expense.status === 'paid' ? colors.success : 
                        expense.status === 'pending' ? colors.warning : colors.danger,
              textColor: [255, 255, 255],
              cellPadding: 2,
              fontSize: 8
            }
          }
        })),
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30 },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function(data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          // Add page number
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Page ${data.pageCount} of ${pageCount}`, 
            pageWidth - 20, 
            pageHeight - 10,
            { align: 'right' }
          );
          
          // Add generated timestamp
          doc.text(
            `Generated on: ${format(new Date(), 'MMM d, yyyy hh:mm a')}`, 
            20, 
            pageHeight - 10
          );
          
          // Add company name
          doc.setFont('helvetica', 'bold');
          doc.text('ECO CYCLE LANKA (PVT) LTD', pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });
      
      // Save the PDF
      doc.save(`expenses-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      // Dismiss loading toast
      toast.dismiss();
      toast.success('Expenses summary report generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="expenses-summary-report p-4">
      {/* Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-white shadow rounded">
          <div className="flex items-center justify-between">
            <DollarSign className="text-teal-500" />
            <ArrowUpRight className="text-green-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-lg font-bold">{formatCurrency(expensesData.totalExpenses)}</p>
          </div>
        </div>
        <div className="card p-4 bg-white shadow rounded">
          <div className="flex items-center justify-between">
            <CheckCircle className="text-green-500" />
            <ArrowUpRight className="text-green-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-lg font-bold">{formatCurrency(expensesData.paidExpenses)}</p>
          </div>
        </div>
        <div className="card p-4 bg-white shadow rounded">
          <div className="flex items-center justify-between">
            <Clock className="text-orange-500" />
            <ArrowDownRight className="text-orange-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-lg font-bold">{formatCurrency(expensesData.pendingExpenses)}</p>
          </div>
        </div>
        <div className="card p-4 bg-white shadow rounded">
          <div className="flex items-center justify-between">
            <XCircle className="text-red-500" />
            <ArrowDownRight className="text-red-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-lg font-bold">{formatCurrency(expensesData.failedExpenses)}</p>
          </div>
        </div>
      </div>

      {/* PDF Export */}
      <div className="mb-6">
        <Button onClick={exportToPDF} className="flex items-center gap-2">
          <Download size={16} /> Export to PDF
        </Button>
      </div>

      {/* Charts / Tables can go here if needed */}
    </div>
  );
};

export default ExpensesSummaryReport;
