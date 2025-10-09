import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  DollarSign,
  User,
  Calendar,
  ChevronDown,
  X,
  CreditCard,
  Info,
  AlertCircle,
  File,
  Download as DownloadIcon,
  Image,
  FileText,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to calculate order total
const calculateOrderTotal = (products = []) => {
  return products.reduce((total, product) => {
    const quantity = product.quantity || 0;
    const price = product.unitPrice || 0;
    return total + (quantity * price);
  }, 0);
};

// Helper to determine payment status
const getPaymentStatus = (order) => {
  if (order.paymentStatus) return order.paymentStatus;
  if (order.payment && order.payment.status) return order.payment.status;
  return 'unpaid';
};

export default function PaymentsManagement() {
  // Format currency with LKR and thousand separators
  const formatCurrency = (amount) => {
    // Handle loading/error states
    if (amount === 'Loading...' || amount === 'Error') return amount;
    
    // Convert string numbers to numbers if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    
    if (isNaN(numAmount)) return 'LKR 0.00';
    
    return `LKR ${new Intl.NumberFormat('en-LK', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(numAmount)}`;
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debug: Log order payment statuses
  useEffect(() => {
    if (orders.length > 0) {
      console.log('Order payment statuses:', orders.map(o => ({
        id: o._id,
        paymentStatus: o.paymentStatus,
        status: o.status
      })));
    }
  }, [orders]);

  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/sales/orders`);
        
        // Transform the API response to match our table structure
        const formattedOrders = response.data.map(order => ({
          _id: order._id,
          orderId: order.orderId || `ORD-${order._id.slice(-6).toUpperCase()}`,
          customerName: order.customerName || 'Unknown Customer',
          totalAmount: order.totalAmount || calculateOrderTotal(order.products),
          products: order.products || [],
          orderDate: order.createdAt ? new Date(order.createdAt) : new Date(),
          status: order.status || 'pending',
          paymentStatus: getPaymentStatus(order),
          paymentProof: order.paymentProof || null,
        }));

        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales orders:', err);
        setError('Failed to load sales orders. Please try again later.');
        // Fallback to mock data if API fails
        setOrders([
          {
            _id: '1',
            orderId: 'ORD-001',
            customerName: 'John Doe',
            totalAmount: 125.99,
            products: [{ quantity: 1, unitPrice: 125.99 }],
            orderDate: new Date(),
            status: 'completed',
            paymentStatus: 'paid'
          },
          {
            _id: '2',
            orderId: 'ORD-002',
            customerName: 'Jane Smith',
            totalAmount: 89.50,
            products: [{ quantity: 1, unitPrice: 89.50 }],
            orderDate: new Date(Date.now() - 86400000),
            status: 'pending',
            paymentStatus: 'unpaid'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  // Handle payment status updates
  const handleUpdateStatus = async (orderId, status) => {
    try {
      setIsProcessingPayment(true);
      setError(null);
      
      // Find the order to update
      const orderToUpdate = orders.find(order => order._id === orderId);
      if (!orderToUpdate) {
        throw new Error('Order not found');
      }

      // Define the new statuses based on the action
      const newPaymentStatus = status === 'paid' ? 'completed' : 'failed';
      const newOrderStatus = status === 'paid' ? 'completed' : 'cancelled';

      // Update payment status
      await axios.put(
        `${API_URL}/sales/orders/${orderId}/payment-status`,
        { status: newPaymentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update order status
      await axios.put(
        `${API_URL}/sales/orders/${orderId}/status`,
        { status: newOrderStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update local state for immediate UI feedback
      const updatedOrders = orders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              paymentStatus: newPaymentStatus,
              status: newOrderStatus
            } 
          : order
      );

      setOrders(updatedOrders);

      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          paymentStatus: newPaymentStatus,
          status: newOrderStatus
        }));
      }

      // Show success message
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status. ' + (err.response?.data?.message || 'Please try again.'));
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Helper functions for payment actions
  const markAsPaid = async (orderId) => {
    return handleUpdateStatus(orderId, 'paid');
  };

  const markAsFailed = async (orderId) => {
    return handleUpdateStatus(orderId, 'failed');
  };

  // Handle search input with validation
  const handleSearch = (e) => {
    const value = e.target.value;
    
    // Basic validation - allow alphanumeric, spaces, and common payment/order characters
    const searchRegex = /^[a-zA-Z0-9\s\-\#\@\.\,]*$/;
    
    if (!searchRegex.test(value)) {
      setSearchError('Please use only letters, numbers, and common symbols');
      return;
    }
    
    // Limit search term length
    if (value.length > 50) {
      setSearchError('Search term cannot exceed 50 characters');
      return;
    }
    
    setSearchTerm(value);
    setSearchError('');
    
    // Add to search history if not empty
    if (value.trim() !== '' && !searchHistory.includes(value.trim())) {
      setSearchHistory(prev => [value.trim(), ...prev].slice(0, 5)); // Keep last 5 searches
    }
  };

  // Filter orders based on search and filters with enhanced search capabilities
  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(order => {
      // If search term exists, check multiple fields with different matching strategies
      const searchLower = searchTerm.toLowerCase().trim();
      let matchesSearch = true;
      
      if (searchLower) {
        // Try to match order ID exactly at the start (case-insensitive)
        const orderIdMatch = order.orderId && 
          order.orderId.toLowerCase().startsWith(searchLower);
        
        // Try to match any word in customer name that starts with the search term
        const customerNameMatch = order.customerName && 
          order.customerName.toLowerCase().split(/\s+/).some(word => 
            word.startsWith(searchLower)
          );
        
        // Try to match amount (if search term is a number)
        const amountMatch = !isNaN(parseFloat(searchLower)) && 
          order.totalAmount && 
          parseFloat(order.totalAmount).toFixed(2).includes(searchLower);
        
        // Try to match date (various formats)
        const dateMatch = order.orderDate && 
          (new Date(order.orderDate).toLocaleDateString().includes(searchLower) ||
           new Date(order.orderDate).toISOString().split('T')[0].includes(searchLower));
        
        matchesSearch = orderIdMatch || customerNameMatch || amountMatch || dateMatch;
      }
      
      // Filter by status
      const matchesStatus = filters.status === 'all' || 
        (order.status && order.status.toLowerCase() === filters.status.toLowerCase());
      
      // Filter by payment status
      const matchesPaymentStatus = filters.paymentStatus === 'all' || 
        (order.paymentStatus && order.paymentStatus.toLowerCase() === filters.paymentStatus.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }, [orders, searchTerm, filters.status, filters.paymentStatus]);

  // Pagination logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableElement = document.querySelector('.transactions-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'pending': { bg: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" key="clock" /> },
      'completed': { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" key="check" /> },
      'shipped': { bg: 'bg-blue-100 text-blue-800', icon: <Package className="w-4 h-4" key="package" /> },
      'delivered': { bg: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-4 h-4" key="delivered" /> },
      'cancelled': { bg: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" key="cancelled" /> },
      'paid': { bg: 'bg-green-100 text-green-800', icon: <DollarSign className="w-4 h-4" key="paid" /> },
      'unpaid': { bg: 'bg-orange-100 text-orange-800', icon: <Clock className="w-4 h-4" key="unpaid" /> },
      'partially_paid': { bg: 'bg-yellow-100 text-yellow-800', icon: <DollarSign className="w-4 h-4" key="partial" /> },
      'refunded': { bg: 'bg-gray-100 text-gray-800', icon: <DollarSign className="w-4 h-4" key="refunded" /> }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { bg: 'bg-gray-100 text-gray-800', icon: null };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg}`}>
        {statusInfo.icon && <span className="mr-1">{statusInfo.icon}</span>}
        {status.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')}
      </span>
    );
  };

  // Get status based on payment status
  const getStatusFromPayment = (paymentStatus) => {
    const statusMap = {
      'completed': 'completed',
      'paid': 'completed',
      'partially_paid': 'processing',
      'unpaid': 'pending',
      'pending': 'pending',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };
    return statusMap[paymentStatus?.toLowerCase()] || 'pending';
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'completed': {
        text: 'Paid',
        bg: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
        dot: 'bg-green-500',
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
      },
      'paid': {
        text: 'Paid',
        bg: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
        dot: 'bg-green-500',
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
      },
      'failed': {
        text: 'Failed',
        bg: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
        dot: 'bg-red-500',
        icon: <XCircle className="h-3.5 w-3.5 mr-1" />
      },
      'pending': {
        text: 'Pending',
        bg: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
        dot: 'bg-yellow-500',
        icon: <Clock className="h-3.5 w-3.5 mr-1" />
      },
      'unpaid': {
        text: 'Unpaid',
        bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
        dot: 'bg-amber-500',
        icon: <Clock className="h-3.5 w-3.5 mr-1" />
      },
      'cancelled': {
        text: 'Cancelled',
        bg: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20',
        dot: 'bg-gray-500',
        icon: <XCircle className="h-3.5 w-3.5 mr-1" />
      },
      'refunded': {
        text: 'Refunded',
        bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
        dot: 'bg-blue-500',
        icon: <DollarSign className="h-3.5 w-3.5 mr-1" />
      },
      'processing': {
        text: 'Processing',
        bg: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
        dot: 'bg-indigo-500',
        icon: <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
      }
    };

    const statusInfo = statusMap[status?.toLowerCase()] || statusMap['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>
    );
  };

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    if (loading) {
      return {
        totalOrders: 'Loading...',
        paidOrders: 'Loading...',
        pendingOrders: 'Loading...',
        totalAmount: 'Loading...',
        paidAmount: 'Loading...',
        pendingAmount: 'Loading...',
        avgOrderValue: 'Loading...',
        paidPercentage: 'Loading...',
        pendingPercentage: 'Loading...'
      };
    }

    if (error) {
      return {
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        avgOrderValue: 0,
        paidPercentage: 0,
        pendingPercentage: 0
      };
    }

    // Ensure we have valid orders array
    if (!Array.isArray(orders) || orders.length === 0) {
      return {
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        avgOrderValue: 0,
        paidPercentage: 0,
        pendingPercentage: 0
      };
    }

    const paidOrders = orders.filter(order => ['paid', 'completed'].includes(order.paymentStatus?.toLowerCase()));
    const pendingOrders = orders.filter(order => {
      const status = order.paymentStatus?.toLowerCase();
      return status === 'pending' || status === 'partially_paid' || status === 'unpaid';
    });
    const failedOrders = orders.filter(order => order.paymentStatus?.toLowerCase() === 'failed');
    
    // Calculate paid amount (only from paid orders)
    const paidAmount = parseFloat(paidOrders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount) || 0;
      return sum + amount;
    }, 0).toFixed(2));

    // Calculate pending amount (from unpaid/partially paid orders)
    const pendingAmount = parseFloat(pendingOrders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount) || 0;
      return sum + amount;
    }, 0).toFixed(2));
    
    // Calculate failed payments amount
    const failedAmount = parseFloat(failedOrders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount) || 0;
      return sum + amount;
    }, 0).toFixed(2));
    
    // Total revenue is the same as paid amount
    const totalRevenue = paidAmount;

    const totalOrders = orders.length;
    const paidOrdersCount = paidOrders.length;
    const pendingOrdersCount = pendingOrders.length;
    
    return {
      totalOrders,
      paidOrders: paidOrdersCount,
      pendingOrders: pendingOrdersCount,
      failedOrders: failedOrders.length,
      totalRevenue,
      failedAmount,
      pendingAmount,
      avgOrderValue: paidOrdersCount > 0 ? parseFloat((totalRevenue / paidOrdersCount).toFixed(2)) : 0,
      pendingPercentage: (totalRevenue + pendingAmount) > 0 ? Math.round((pendingAmount / (totalRevenue + pendingAmount)) * 100) : 0,
      failedPercentage: (totalRevenue + pendingAmount + failedAmount) > 0 ? Math.round((failedAmount / (totalRevenue + pendingAmount + failedAmount)) * 100) : 0
    };
  }, [orders, loading, error]);

  const StatCard = ({ title, value, change, icon: Icon, trend }) => {
    const getTrendColor = () => {
      if (trend === 'up') return 'text-green-500';
      if (trend === 'down') return 'text-red-500';
      return 'text-gray-500';
    };

    const getTrendIcon = () => {
      if (trend === 'up') return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
      if (trend === 'down') return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
      return null;
    };

    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
              <div className="mt-2">
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-blue-50'}`}>
              <Icon className={`h-6 w-6 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
          </div>
          {change && (
            <div className={`mt-4 flex items-center text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{change}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // File Preview Component
  const FilePreview = ({ file }) => {
    const [objectUrl, setObjectUrl] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [previewUrl, setPreviewUrl] = React.useState(null);
    
    // Helper function to check if object is file-like
    const isFile = (obj) => {
      return (
        (typeof File !== 'undefined' && obj instanceof File) || 
        (typeof Blob !== 'undefined' && obj instanceof Blob) ||
        (typeof obj === 'object' && 
         obj !== null && 
         'size' in obj && 
         'type' in obj)
      );
    };
    
    // Get file extension from URL or path
    const getFileExtension = (url) => {
      if (!url) return '';
      const match = url.match(/\.([^./\?]+)(?:\?|$)/);
      return match ? match[1].toLowerCase() : '';
    };
    
    // Get MIME type from file extension
    const getMimeType = (url) => {
      const ext = getFileExtension(url);
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
      };
      return mimeTypes[ext] || 'application/octet-stream';
    };
    
    // Check if the file is an image
    const isImageFile = (url) => {
      const mimeType = getMimeType(url);
      return mimeType.startsWith('image/');
    };
    
    // Check if the file is a PDF
    const isPdfFile = (url) => {
      return getMimeType(url) === 'application/pdf';
    };
    
    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    React.useEffect(() => {
      // Reset states when file changes
      setIsLoading(true);
      setError(null);
      setPreviewUrl(null);
      
      if (!file) {
        setIsLoading(false);
        setError('No file provided');
        return;
      }
      
      let url = null;
      let newObjectUrl = null;
      
      const processFile = async () => {
        try {
          // Handle different file types
          if (typeof file === 'string') {
            // Handle string URLs
            url = file.startsWith('http') || file.startsWith('blob:') 
              ? file 
              : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${file.replace(/^[\\/]+/, '')}`;
          } else if (file.url) {
            // Handle object with url property
            url = file.url;
          } else if (file.path) {
            // Handle object with path property
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const cleanPath = String(file.path).replace(/^[\\/]+/, '');
            url = `${baseUrl.replace(/\/+$/, '')}/${cleanPath}`;
          } else if (isFile(file)) {
            // Handle File or Blob objects
            try {
              newObjectUrl = URL.createObjectURL(file);
              url = newObjectUrl;
              setObjectUrl(prevUrl => {
                if (prevUrl) URL.revokeObjectURL(prevUrl);
                return newObjectUrl;
              });
            } catch (e) {
              console.error('Error creating object URL:', e);
              throw new Error('Unsupported file type');
            }
          } else {
            throw new Error('Unsupported file format');
          }
          
          // Set the preview URL
          setPreviewUrl(url);
          
          // If it's a remote URL, we'll let the browser handle loading
          if (url.startsWith('http')) {
            // We'll use the browser's built-in loading for remote URLs
            setIsLoading(false);
          }
          
        } catch (err) {
          console.error('Error processing file:', err);
          setError(err.message || 'Failed to load preview');
          setIsLoading(false);
        }
      };
      
      processFile();
      
      // Set loading timeout
      const timer = setTimeout(() => {
        if (isLoading) {
          setError('Preview is taking longer than expected. The file might be large or the server might be slow.');
          setIsLoading(false);
        }
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        // Clean up object URL on unmount or file change
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [file]); // Re-run when file changes

    // Get file info
    const getFileInfo = () => {
      if (!file) return { 
        name: 'payment-proof', 
        type: '', 
        isImage: false, 
        isPDF: false,
        extension: '',
        size: file?.size ? file.size : 0,
        formattedSize: file?.size ? formatFileSize(file.size) : 'N/A'
      };
      
      const name = file.originalname || file.originalName || file.name || 'payment-proof';
      const type = file.mimetype || file.type || getMimeType(file.path || file.url || '');
      const url = previewUrl || file.url || '';
      const extension = getFileExtension(url) || name.split('.').pop() || '';
      
      return {
        name,
        type,
        extension: extension.toLowerCase(),
        size: file.size || 0,
        formattedSize: file.size ? formatFileSize(file.size) : 'N/A',
        isImage: type.startsWith('image/') || isImageFile(url),
        isPDF: type === 'application/pdf' || isPdfFile(url) || extension.toLowerCase() === 'pdf',
        url
      };
    };
    
    const { 
      name: fileName, 
      type: fileType, 
      isImage, 
      isPDF, 
      extension,
      formattedSize,
      url: fileUrl
    } = getFileInfo();
    
    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleError = (e) => {
      console.error('Error loading file preview:', e);
      setIsLoading(false);
      setError('Failed to load preview. The file may be corrupted or in an unsupported format.');
    };
    
    // Get file icon based on extension
    const getFileIcon = () => {
      if (isImage) return <Image className="h-8 w-8 text-blue-500" />;
      if (isPDF) return <FileText className="h-8 w-8 text-red-500" />;
      if (['doc', 'docx'].includes(extension)) return <FileText className="h-8 w-8 text-blue-600" />;
      if (['xls', 'xlsx'].includes(extension)) return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
      return <File className="h-8 w-8 text-gray-500" />;
    };
    
    // Determine the best way to display the file
    const renderPreview = () => {
      if (!previewUrl && !fileUrl) {
        return (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <File className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">No file available</p>
          </div>
        );
      }

      // Show loading state
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-sm text-gray-500">Loading preview...</p>
          </div>
        );
      }

      // Show error state
      if (error) {
        return (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="h-10 w-10 mx-auto text-red-400 mb-2" />
            <p className="text-red-600 font-medium">Preview Unavailable</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            {(previewUrl || fileUrl) && (
              <a 
                href={previewUrl || fileUrl} 
                download={fileName}
                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                Download File
              </a>
            )}
          </div>
        );
      }

      // Show image preview
      if (isImage) {
        return (
          <div className="relative h-64 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <Image className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs font-medium text-gray-700 truncate max-w-xs">{fileName}</span>
              </div>
              <a 
                href={previewUrl || fileUrl} 
                download={fileName}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                onClick={(e) => e.stopPropagation()}
                title="Download"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-2">
              <img 
                src={previewUrl || fileUrl} 
                alt={`Preview of ${fileName}`}
                className="max-w-full max-h-full object-contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          </div>
        );
      }
      
      // Show PDF preview
      if (isPDF) {
        return (
          <div className="h-96 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-xs font-medium text-gray-700 truncate max-w-xs">{fileName}</span>
              </div>
              <a 
                href={previewUrl || fileUrl} 
                download={fileName}
                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                onClick={(e) => e.stopPropagation()}
                title="Download"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex-1 bg-gray-50">
              <iframe 
                src={`${previewUrl || fileUrl}#view=fitH&toolbar=0&navpanes=0`}
                title={`PDF Preview: ${fileName}`}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        );
      }
      
      // For other file types, show a download button with file info
      return (
        <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-3">
            {getFileIcon()}
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1 truncate px-4">{fileName}</h4>
          <div className="flex justify-center items-center text-xs text-gray-500 mb-4 space-x-2">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{extension.toUpperCase()}</span>
            <span>•</span>
            <span>{formattedSize}</span>
          </div>
          <a 
            href={previewUrl || fileUrl} 
            download={fileName}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download File
          </a>
        </div>
      );
    };

    return (
      <div className="w-full">
        {renderPreview()}
      </div>
    );
  };

  // Render file preview based on file type
  const renderFilePreview = (file) => {
    if (!file || !file.path) return null;
    return <FilePreview file={file} />;
  };

  // Order Details Modal
  const OrderDetailsModal = ({ order, onClose, onUpdateStatus }) => {
    if (!order) return null;

    const handleStatusUpdate = async (status) => {
      const success = await onUpdateStatus(order._id, status);
      if (success) {
        onClose();
      }
    };

    return (
      <Transition.Root show={!!order} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <CreditCard className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Order #{order.orderId}
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Customer:</span>
                            <span>{order.customerName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Order Date:</span>
                            <span>{order.orderDate ? format(new Date(order.orderDate), 'PPpp') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Status:</span>
                            <span>{getStatusBadge(order.status)}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Payment Status:</span>
                            <span>{getStatusBadge(order.paymentStatus || 'unpaid')}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Total Amount:</span>
                            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                    <div className="mt-2 space-y-2">
                      {order.products?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name || `Item ${index + 1}`} x {item.quantity || 1}</span>
                          <span className="font-medium text-gray-900">{formatCurrency((item.unitPrice || 0) * (item.quantity || 1))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.paymentProof && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Proof</h4>
                      <FilePreview file={order.paymentProof} />
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="mt-5 sm:mt-6
                    sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    {order.paymentStatus === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:col-start-2"
                          onClick={() => handleStatusUpdate('paid')}
                          disabled={isProcessingPayment}
                        >
                          {isProcessingPayment ? 'Processing...' : 'Mark as Paid'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                          onClick={() => handleStatusUpdate('failed')}
                          disabled={isProcessingPayment}
                        >
                          Mark as Failed
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 relative">
      {/* Order Details Modal */}
      <OrderDetailsModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onUpdateStatus={handleUpdateStatus}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(summary.totalRevenue)} 
          icon={DollarSign}
          change={`${summary.paidOrders} ${summary.paidOrders === 1 ? 'paid order' : 'paid orders'}`}
        />
        <StatCard 
          title="Failed Payments" 
          value={formatCurrency(summary.failedAmount)}
          change={`${summary.failedPercentage}% of total`}
          icon={XCircle}
          trend="down"
        />
        <StatCard 
          title="Pending Amount" 
          value={formatCurrency(summary.pendingAmount)}
          change={`${summary.pendingPercentage}% of total`}
          icon={Clock}
          trend={summary.pendingAmount > 0 ? "down" : "up"}
        />
        <StatCard 
          title="Avg. Order Value" 
          value={formatCurrency(summary.avgOrderValue)}
          change={`${summary.paidOrders} of ${summary.totalOrders} paid`}
          icon={DollarSign}
          trend={summary.paidPercentage >= 50 ? "up" : "down"}
        />
      </div>

      <div className="mt-12 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {Math.min(indexOfFirstItem + 1, totalItems)}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search orders by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="status-filter"
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <select
              id="payment-status-filter"
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={filters.paymentStatus}
              onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col transactions-table-container">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Order ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Items
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Order Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Payment
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-3 py-8 text-sm text-gray-500 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                        <p className="mt-2">Loading orders...</p>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-3 py-8 text-sm text-gray-500 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || filters.status !== 'all' || filters.paymentStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No sales orders have been placed yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((order) => (
                      <tr 
                        key={order._id} 
                        className={`transition-colors duration-150 ${order.paymentStatus?.toLowerCase() === 'failed' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                          {order.orderId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-[150px]" title={order.customerName}>
                              {order.customerName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            {order.products?.length || 0} items
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getStatusBadge(order.status || 'pending')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {getPaymentStatusBadge(order.paymentStatus || 'unpaid')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            {['pending', 'unpaid', 'partially_paid', 'failed'].includes(order.paymentStatus?.toLowerCase()) && (
                              <>
                                <button
                                  onClick={() => markAsPaid(order._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Mark as Paid"
                                  disabled={isProcessingPayment}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => markAsFailed(order._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Mark as Failed"
                                  disabled={isProcessingPayment}
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min(indexOfFirstItem + 1, totalItems)}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                      <span className="font-medium">{totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">First</span>
                        &laquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
                      </button>
                      
                      {/* Page numbers */}
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
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Last</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
