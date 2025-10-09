import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  CreditCard,
  AlertCircle,
  X,
  User
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { format } from 'date-fns';
import { salesApi } from '../../../services/salesApi';
import { toast } from 'react-hot-toast';

// Order Details Modal Component
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const calculateTotal = (items = []) => {
    if (!Array.isArray(items)) return '0.00';
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return total + (quantity * price);
    }, 0).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderId || 'N/A'}</h2>
            <p className="text-gray-500">
              <Calendar className="inline h-4 w-4 mr-1" />
              {new Date(order.createdAt).toLocaleDateString('en-LK')}
              <Clock className="inline h-4 w-4 ml-3 mr-1" />
              {new Date(order.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </div>
            <div className="space-y-3 pl-7">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Order ID:</span>
                <span className="font-medium">{order.orderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Customer:</span>
                <span>{order.customerId?.name || order.customerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Amount</h3>
            </div>
            <div className="space-y-2 pl-7">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {Number(order.totalAmount || calculateTotal(order.products || [])).toLocaleString('en-LK', {
                    style: 'currency',
                    currency: 'LKR',
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(order.products) && order.products.length > 0 ? (
                  order.products.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productName || 'Product'}</div>
                        <div className="text-sm text-gray-500">{item.productId || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {Number(item.unitPrice || 0).toLocaleString('en-LK', {
                          style: 'currency',
                          currency: 'LKR',
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {Number(item.quantity * item.unitPrice || 0).toLocaleString('en-LK', {
                          style: 'currency',
                          currency: 'LKR',
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No items found in this order.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {Number(order.totalAmount || calculateTotal(order.products || [])).toLocaleString('en-LK', {
                      style: 'currency',
                      currency: 'LKR',
                      minimumFractionDigits: 2
                    })}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersSummaryReport = ({ dateRange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    trend: 0,
    recentOrders: []
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get orders from the API
      const response = await salesApi.getAllOrders();
      
      // Ensure response.data is an array
      const allOrders = Array.isArray(response) ? response : (response.data || []);
      
      // Filter orders by date range
      const filteredOrders = allOrders.filter(order => {
        if (!order) return false;
        try {
          const orderDate = new Date(order.createdAt || order.orderDate);
          return orderDate >= dateRange.from && orderDate <= dateRange.to;
        } catch (e) {
          console.error('Error parsing order date:', order);
          return false;
        }
      });
      
      // Calculate statistics
      const totalOrders = filteredOrders.length;
      const completedOrders = filteredOrders.filter(order => 
        String(order.status || '').toLowerCase() === 'completed'
      ).length;
      const pendingOrders = filteredOrders.filter(order => 
        String(order.status || '').toLowerCase() === 'pending'
      ).length;
      const failedOrders = filteredOrders.filter(order => 
        ['failed', 'cancelled'].includes(String(order.status || '').toLowerCase())
      ).length;
      
      const totalRevenue = filteredOrders
        .filter(order => String(order.status || '').toLowerCase() === 'completed')
        .reduce((sum, order) => {
          const amount = Number(order.totalAmount) || 0;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      
      const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
      
      // Process recent orders
      const recentOrders = [...filteredOrders]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.orderDate || 0);
          const dateB = new Date(b.createdAt || b.orderDate || 0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(order => {
          const orderId = order.orderId || 
                         (order._id ? `ORD-${String(order._id).slice(-6).toUpperCase()}` : 'N/A');
          
          return {
            id: order._id || order.id || `order-${Math.random().toString(36).substr(2, 9)}`,
            orderId,
            date: order.createdAt || order.orderDate || new Date().toISOString(),
            amount: Number(order.totalAmount) || 0,
            status: order.status || 'pending',
            customerName: order.customerName || 
                         (order.customerId?.name || order.customer || 'Guest')
          };
        });
      
      // Calculate trend (simple implementation - in a real app, compare with previous period)
      const trend = totalOrders > 0 ? 5 : 0;
      
      // Update state
      setStats({
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        totalRevenue,
        avgOrderValue,
        trend,
        recentOrders
      });
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Load image helper function
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
      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Please select a valid date range');
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Import and initialize AutoTable
      const { autoTable } = await import('jspdf-autotable');
      
      // Professional color scheme
      const colors = {
        primary: '#0d9488',     // Teal - professional and ensures logo visibility
        secondary: '#2e7d32',   // Green
        accent: '#ff6f00',      // Orange
        lightBg: '#f8fafc',     // Light gray background
        textLight: '#ffffff',   // White text
        textDark: '#1e293b',    // Dark text
        border: '#e2e8f0'       // Light border
      };
      
      // Wait for the logo to load
      const logo = await loadImage('/ecocycle-logo.png');
      
      // Header with professional styling - full width
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, 210, 30, 'F'); // Increased height from 20 to 30
      
      // Add logo to header (left side) with better spacing
      if (logo) {
        const logoWidth = 40; // Increased from 30
        const logoHeight = (logo.height * logoWidth) / logo.width;
        const logoX = 20; // More padding from left
        const logoY = 15 - (logoHeight / 2); // Centered vertically in taller header
        doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      }
      
      // Company info (right side) with better spacing
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20); // Slightly larger
      doc.setTextColor(colors.textLight);
      doc.text('ECOCYCLE LANKA (PVT) LTD', 70, 15, { align: 'left' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', 70, 21, { align: 'left' });
      doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', 70, 26, { align: 'left' });
      
      // Header bottom border - full width with accent color
      doc.setDrawColor(colors.accent);
      doc.setLineWidth(0.8); // Slightly thicker line
      doc.line(15, 30, 195, 30);
      
      // Report title section with better spacing
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary);
      doc.text('ORDERS SUMMARY REPORT', 105, 45, { align: 'center' });
      
      // Decorative line under title
      doc.setDrawColor(colors.accent);
      doc.setLineWidth(1);
      doc.line(60, 48, 150, 48);
      
      // Report period and generation date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Background for report info
      doc.setFillColor(colors.lightBg);
      doc.roundedRect(15, 55, 180, 12, 2, 2, 'F');
      
      // Report period with dot
      doc.setFillColor(colors.primary);
      doc.circle(25, 62, 2, 'F');
      doc.setTextColor(colors.textDark);
      doc.text(`Report Period: ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`, 30, 62);
      
      // Generated date with dot
      doc.setFillColor(colors.secondary);
      doc.circle(25, 72, 2, 'F');
      doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy hh:mm a')}`, 30, 72);
      
      // Add summary cards
      const startY = 85;
      const cardWidth = 60;
      const cardHeight = 30;
      
      // Card 1: Total Orders
      doc.setFillColor(colors.lightBg);
      doc.roundedRect(15, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(colors.border);
      doc.roundedRect(15, startY, cardWidth, cardHeight, 3, 3, 'S');
      doc.setFontSize(10);
      doc.setTextColor(colors.textDark);
      doc.text('Total Orders', 25, startY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(stats.totalOrders.toString(), 25, startY + 16);
      
      // Card 2: Total Revenue
      doc.setFillColor(colors.lightBg);
      doc.roundedRect(85, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(colors.border);
      doc.roundedRect(85, startY, cardWidth, cardHeight, 3, 3, 'S');
      doc.setFontSize(10);
      doc.setTextColor(colors.textDark);
      doc.text('Total Revenue', 95, startY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`LKR ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 95, startY + 16);
      
      // Card 3: Avg. Order Value
      doc.setFillColor(colors.lightBg);
      doc.roundedRect(155, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(colors.border);
      doc.roundedRect(155, startY, cardWidth, cardHeight, 3, 3, 'S');
      doc.setFontSize(10);
      doc.setTextColor(colors.textDark);
      doc.text('Avg. Order Value', 165, startY + 8);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const avgOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0;
      doc.text(`LKR ${avgOrderValue.toLocaleString('en-US')}`, 165, startY + 16);

      // Add status distribution table
      const statusData = [
        { status: 'Completed', count: stats.completedOrders, color: '#22c55e' },
        { status: 'Pending', count: stats.pendingOrders, color: '#eab308' },
        { status: 'Failed/Cancelled', count: stats.failedOrders, color: '#ef4444' }
      ];

      // Status table
      autoTable(doc, {
        startY: startY + cardHeight + 15,
        head: [
          [
            { content: 'Status', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold' } },
            { content: 'Count', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold', halign: 'center' } },
            { content: 'Percentage', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold', halign: 'center' } }
          ]
        ],
        body: statusData.map(status => {
          const percentage = stats.totalOrders > 0 ? 
            `${((status.count / stats.totalOrders) * 100).toFixed(1)}%` : '0%';
          return [
            { content: status.status, styles: { textColor: status.color, fontStyle: 'bold' } },
            { content: status.count.toString(), styles: { halign: 'center' } },
            { content: percentage, styles: { halign: 'center' } }
          ];
        }),
        theme: 'grid',
        headStyles: { 
          fillColor: colors.primary,
          textColor: colors.textLight,
          fontStyle: 'bold',
          lineWidth: 0.1
        },
        styles: {
          fontSize: 10,
          cellPadding: 6,
          lineWidth: 0.1,
          lineColor: colors.border
        },
        margin: { left: 15, right: 15 }
      });

      // Recent Orders Table
      const recentOrdersData = orders.slice(0, 10).map(order => {
        // Handle customer name with proper fallbacks
        const customerName = order.customerId?.name || 
                           order.customerName || 
                           (order.customerId ? 'Customer' : 'Walk-in Customer');
        
        return {
          id: order._id,
          orderId: order.orderId,
          date: new Date(order.createdAt).toLocaleDateString('en-LK'),
          customer: customerName,
          customerId: order.customerId, // Keep reference to customerId for later use
          customerName: order.customerName, // Keep reference to customerName for later use
          amount: order.totalAmount.toFixed(2),
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()
        };
      });

      // Table configuration
      const tableConfig = {
        startY: doc.lastAutoTable.finalY + 15,
        head: [
          [
            { content: 'Order ID', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold' } },
            { content: 'Date', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold' } },
            { content: 'Customer', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold' } },
            { content: 'Amount (LKR)', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold', halign: 'right' } },
            { content: 'Status', styles: { fillColor: colors.primary, textColor: colors.textLight, fontStyle: 'bold', halign: 'center' } }
          ]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: colors.primary,
          textColor: colors.textLight,
          fontStyle: 'bold',
          lineWidth: 0.1
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineWidth: 0.1,
          lineColor: colors.border,
          overflow: 'linebreak'
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function(data) {
          // Footer with page number
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Page ${currentPage} of ${pageCount} | Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      };

      // Generate the orders table
      autoTable(doc, {
        ...tableConfig,
        body: recentOrdersData.map(order => {
          const statusColor = 
            order.status.toLowerCase() === 'completed' ? '#22c55e' :
            order.status.toLowerCase() === 'pending' ? '#eab308' : '#ef4444';
            
          // Get customer name from order data, handling both populated customerId and direct customerName
          const customerName = order.customerId?.name || 
                             order.customerName || 
                             (order.customerId ? 'Customer' : 'Walk-in Customer');
          
          return [
            { 
              content: `#${order.orderId || 'N/A'}`,
              styles: { cellWidth: 'auto' }
            },
            { 
              content: order.date || 'N/A',
              styles: { cellWidth: 'auto' }
            },
            { 
              content: customerName,
              styles: { 
                cellWidth: 'auto',
                maxLineWidth: 60 // Prevent long names from breaking layout
              } 
            },
            { 
              content: order.amount ? 
                parseFloat(order.amount).toLocaleString('en-US', { 
                  minimumFractionDigits: 2 
                }) : '0.00', 
              styles: { 
                halign: 'right',
                cellWidth: 'auto'
              } 
            },
            { 
              content: order.status ? 
                order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A', 
              styles: { 
                textColor: statusColor,
                fontStyle: 'bold',
                halign: 'center',
                cellWidth: 'auto'
              } 
            }
          ];
        })
      });

      // Save the PDF
      const fileName = `Orders_Summary_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading order data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchOrders}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusStr = String(status).toLowerCase();
    
    if (statusStr.includes('complete')) return 'bg-green-100 text-green-800';
    if (statusStr.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    if (statusStr.includes('fail') || statusStr.includes('cancel')) return 'bg-red-100 text-red-800';
    
    return 'bg-gray-100 text-gray-800';
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const { 
    totalOrders, 
    completedOrders, 
    pendingOrders, 
    failedOrders, 
    totalRevenue, 
    avgOrderValue, 
    trend,
    recentOrders 
  } = stats;

  const statusData = [
    { 
      status: 'Completed', 
      count: completedOrders,
      color: 'bg-green-500',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    { 
      status: 'Pending', 
      count: pendingOrders,
      color: 'bg-yellow-500',
      icon: <Clock className="h-4 w-4 text-yellow-500" />
    },
    { 
      status: 'Failed/Cancelled', 
      count: failedOrders,
      color: 'bg-red-500',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders Summary</h2>
          <p className="text-sm text-gray-500">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOrders} 
            disabled={isLoading}
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToPDF}
            className="border-gray-300 hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-white rounded-lg border-l-4 border-blue-600 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Orders</h3>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-gray-900">
                {totalOrders.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  totalOrders >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {totalOrders >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(totalOrders)}% from last period
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Orders Card */}
        <div className="bg-white rounded-lg border-l-4 border-green-600 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed Orders</h3>
              <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-gray-900">
                {completedOrders.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  completedOrders >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {completedOrders >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(completedOrders)}% from last period
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-lg border-l-4 border-orange-500 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending Orders</h3>
              <div className="p-1.5 rounded-md bg-orange-50 text-orange-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-gray-900">
                {pendingOrders.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  pendingOrders >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pendingOrders >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(pendingOrders)}% from last period
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Failed/Cancelled Orders Card */}
        <div className="bg-white rounded-lg border-l-4 border-red-600 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Failed/Cancelled Orders</h3>
              <div className="p-1.5 rounded-md bg-red-50 text-red-600">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-gray-900">
                {failedOrders.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                  failedOrders >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {failedOrders >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(failedOrders)}% from last period
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg border-l-4 border-green-600 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Revenue</h3>
              <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Avg. Order</div>
                <p className="text-sm font-medium text-gray-700">
                  LKR {avgOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Order Value Card */}
        <div className="bg-white rounded-lg border-l-4 border-blue-600 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Average Order Value</h3>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'LKR',
                  minimumFractionDigits: 2
                }).format(avgOrderValue)}
              </p>
              <div className="mt-2">
                <div className="text-xs text-gray-500">Per Order</div>
                <p className="text-sm font-medium text-gray-700">
                  {totalOrders} orders total
                </p>
              </div>
              <div className="mt-2">
                <div className="bg-blue-100 p-2 rounded-full inline-block">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Orders by Status</h3>
            <div className="space-y-4">
              {statusData.map((status) => (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${status.color}`}>
                        {status.icon}
                      </div>
                      <span className="font-medium">{status.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {status.count} orders ({
                        totalOrders > 0 
                          ? ((status.count / totalOrders) * 100).toFixed(1) 
                          : '0'
                      }%)
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        status.status === 'Completed' ? 'bg-green-500' :
                        status.status === 'Pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      } rounded-full`}
                      style={{
                        width: totalOrders > 0 ? `${(status.count / totalOrders) * 100}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order, index) => (
                <div key={order._id || index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.orderId || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerId?.name || order.customerName || 'Guest'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {Number(order.totalAmount || 0).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'LKR',
                          minimumFractionDigits: 2
                        })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersSummaryReport;
