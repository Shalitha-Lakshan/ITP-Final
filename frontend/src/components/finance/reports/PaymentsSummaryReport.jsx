import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Banknote,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../ui/button';
import { format, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentsSummaryReport = ({ dateRange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentsData, setPaymentsData] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    avgTransactionValue: 0,
    trend: 0,
    paymentMethods: [],
    recentTransactions: []
  });
  const [error, setError] = useState(null);

  const fetchPaymentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/sales/orders`, {
        params: {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const orders = response.data || [];

      const totalPayments = orders.length;
      const successfulPayments = orders.filter(order => order.paymentStatus === 'completed' || order.status === 'completed').length;
      const pendingPayments = orders.filter(order => order.paymentStatus === 'pending' || (order.status === 'pending' && !order.paymentStatus)).length;
      const failedPayments = orders.filter(order => order.paymentStatus === 'failed' || order.status === 'cancelled').length;

      const totalAmount = orders
        .filter(order => order.paymentStatus === 'completed' || order.status === 'completed')
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

      const avgTransactionValue = successfulPayments > 0 ? totalAmount / successfulPayments : 0;

      const paymentMethods = {};
      orders.forEach(order => {
        const method = order.paymentMethod || 'Unknown';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, amount: 0, successCount: 0 };
        }
        paymentMethods[method].count++;
        if (order.paymentStatus === 'completed' || order.status === 'completed') {
          paymentMethods[method].amount += Number(order.totalAmount) || 0;
          paymentMethods[method].successCount++;
        }
      });

      const formattedPaymentMethods = Object.entries(paymentMethods).map(([name, data]) => ({
        name,
        count: data.count,
        amount: data.amount,
        successRate: Math.round((data.successCount / data.count) * 100) || 0
      }));

      const recentTransactions = orders
        .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          orderId: order.orderId || `ORD-${order._id.slice(-6).toUpperCase()}`,
          date: order.orderDate || order.createdAt || new Date(),
          amount: order.totalAmount,
          method: order.paymentMethod || 'Unknown',
          status: order.paymentStatus || (order.status === 'completed' ? 'completed' : 'pending'),
          customerName: order.customerName || 'Unknown Customer'
        }));

      const previousPeriodEnd = new Date(dateRange.from);
      const previousPeriodStart = subDays(previousPeriodEnd, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24));
      const trend = totalPayments > 0 ? 5 : 0;

      setPaymentsData({
        totalPayments,
        totalAmount,
        successfulPayments,
        pendingPayments,
        failedPayments,
        avgTransactionValue,
        trend,
        paymentMethods: formattedPaymentMethods,
        recentTransactions
      });

    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [dateRange]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (methodName) => {
    const method = methodName.toLowerCase();
    if (method.includes('credit') || method.includes('card')) return <CreditCard className="h-5 w-5" />;
    if (method.includes('bank') || method.includes('transfer')) return <Banknote className="h-5 w-5" />;
    if (method.includes('paypal') || method.includes('digital')) return <DollarSign className="h-5 w-5" />;
    return <CreditCard className="h-5 w-5" />;
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16).setFont('helvetica', 'bold');
      doc.text('ECOCYCLE LANKA (PVT) LTD', 105, 20, { align: 'center' });
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', 105, 28, { align: 'center' });
      doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', 105, 33, { align: 'center' });

      doc.setFontSize(14).setFont('helvetica', 'bold');
      doc.text('PAYMENTS SUMMARY REPORT', 105, 45, { align: 'center' });

      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text(
        `Period: ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`,
        14, 60
      );

      doc.setFontSize(11).setFont('helvetica', 'bold');
      doc.text('Total Payments:', 14, 75);
      doc.text(paymentsData.totalPayments.toString(), 50, 75);
      doc.text('Total Amount:', 100, 75);
      doc.text(`LKR ${paymentsData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 150, 75);
      doc.text('Success Rate:', 14, 85);
      const successRate = paymentsData.totalPayments > 0 ? (paymentsData.successfulPayments / paymentsData.totalPayments * 100).toFixed(1) : 0;
      doc.text(`${successRate}%`, 50, 85);

      autoTable(doc, {
        startY: 95,
        head: [['Payment Method', 'Transactions', 'Total Amount', 'Success Rate']],
        body: paymentsData.paymentMethods.map((method) => [
          method.name,
          method.count,
          `LKR ${method.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          `${method.successRate}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 60 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        margin: { top: 10, left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Date', 'Transaction ID', 'Amount', 'Method', 'Status']],
        body: paymentsData.recentTransactions.map((tx) => [
          format(new Date(tx.date), 'MMM d, yyyy'),
          tx.orderId,
          `LKR ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          tx.method,
          tx.status
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 50 }, 2: { cellWidth: 40, halign: 'right' }, 3: { cellWidth: 40 }, 4: { cellWidth: 30 } },
        margin: { top: 10, left: 15, right: 15 },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      doc.save(`payments-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF.');
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading payment data...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div className="flex">
        <XCircle className="h-5 w-5 text-red-500" />
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPaymentData}
            className="border-red-300 text-red-700 hover:bg-red-50 mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );

  const successRatePercent = paymentsData.totalPayments > 0 ? (paymentsData.successfulPayments / paymentsData.totalPayments * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments Summary</h2>
          <p className="text-sm text-gray-500">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToPDF} className="border-gray-300 hover:bg-gray-50 flex items-center gap-1">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payments */}
        <div className="bg-white rounded-lg border-l-4 border-blue-600 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Payments</h3>
          <p className="text-2xl font-bold text-gray-900">{paymentsData.totalPayments.toLocaleString()}</p>
        </div>
        {/* Total Amount */}
        <div className="bg-white rounded-lg border-l-4 border-green-600 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</h3>
          <p className="text-2xl font-bold text-gray-900">LKR {paymentsData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        {/* Success Rate */}
        <div className="bg-white rounded-lg border-l-4 border-purple-600 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Success Rate</h3>
          <p className="text-2xl font-bold text-gray-900">{successRatePercent}%</p>
        </div>
        {/* Pending/Failed */}
        <div className="bg-white rounded-lg border-l-4 border-orange-500 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Status</h3>
          <p className="text-sm text-gray-600">Pending: {paymentsData.pendingPayments}</p>
          <p className="text-sm text-gray-600">Failed: {paymentsData.failedPayments}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSummaryReport;
