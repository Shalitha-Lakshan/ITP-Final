import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Payment Methods API
export const paymentMethodsApi = {
  // Get all payment methods
  getAll: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Get payment method by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/methods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  },

  // Create new payment method
  create: async (methodData) => {
    try {
      const response = await api.post('/payments/methods', methodData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  // Update payment method
  update: async (id, methodData) => {
    try {
      const response = await api.put(`/payments/methods/${id}`, methodData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete payment method
  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/methods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Get payment method distribution analytics
  getDistribution: async () => {
    try {
      const response = await api.get('/payments/distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment distribution:', error);
      throw error;
    }
  },

  // Get payment trends
  getTrends: async (period = '6months') => {
    try {
      const response = await api.get(`/payments/trends?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment trends:', error);
      throw error;
    }
  }
};

// Payment Processing API
export const paymentProcessingApi = {
  // Get all payments
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/payments/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get payment by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Create new payment
  create: async (paymentData) => {
    try {
      const response = await api.post('/payments/transactions', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Process payment
  process: async (paymentId, processingData = {}) => {
    try {
      const response = await api.post(`/payments/transactions/${paymentId}/process`, processingData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Update payment status
  updateStatus: async (paymentId, status, notes = '') => {
    try {
      const response = await api.patch(`/payments/transactions/${paymentId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Cancel payment
  cancel: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`/payments/transactions/${paymentId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },

  // Refund payment
  refund: async (paymentId, amount, reason = '') => {
    try {
      const response = await api.post(`/payments/transactions/${paymentId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Get payment analytics
  getAnalytics: async (dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/payments/analytics?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }
};

// Customer Payments API
export const customerPaymentsApi = {
  // Get customer payments
  getCustomerPayments: async (customerId) => {
    try {
      const response = await api.get(`/payments/customers/${customerId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  },

  // Get customer payment history
  getPaymentHistory: async (customerId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/payments/customers/${customerId}/history?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Send payment reminder
  sendReminder: async (paymentId, reminderType = 'email') => {
    try {
      const response = await api.post(`/payments/transactions/${paymentId}/reminder`, {
        type: reminderType
      });
      return response.data;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  }
};

// Invoice API
export const invoiceApi = {
  // Get all invoices
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/payments/invoices?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/payments/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  // Create new invoice
  create: async (invoiceData) => {
    try {
      const response = await api.post('/payments/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Update invoice
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/payments/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  // Delete invoice
  delete: async (id) => {
    try {
      const response = await api.delete(`/payments/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  // Generate invoice PDF
  generatePDF: async (id) => {
    try {
      const response = await api.get(`/payments/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  },

  // Send invoice via email
  sendEmail: async (id, emailData) => {
    try {
      const response = await api.post(`/payments/invoices/${id}/send`, emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }
};

// Financial Reports API
export const financialReportsApi = {
  // Get financial summary
  getSummary: async (dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/payments/reports/summary?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  // Get revenue report
  getRevenueReport: async (period = 'monthly', year = new Date().getFullYear()) => {
    try {
      const response = await api.get(`/payments/reports/revenue?period=${period}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  },

  // Get payment method performance
  getMethodPerformance: async (dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/payments/reports/method-performance?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching method performance:', error);
      throw error;
    }
  },

  // Export financial data
  exportData: async (reportType, format = 'csv', dateRange = {}) => {
    try {
      const queryParams = new URLSearchParams({
        ...dateRange,
        format
      }).toString();
      const response = await api.get(`/payments/reports/export/${reportType}?${queryParams}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      throw error;
    }
  }
};

// Utility functions
export const paymentUtils = {
  // Format currency
  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Calculate payment fee
  calculateFee: (amount, feePercentage) => {
    return (amount * feePercentage) / 100;
  },

  // Generate payment reference
  generateReference: (prefix = 'PAY') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  // Validate payment data
  validatePaymentData: (paymentData) => {
    const errors = {};
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!paymentData.customerId) {
      errors.customerId = 'Customer ID is required';
    }
    
    if (!paymentData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }
    
    if (!paymentData.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Default export with all APIs
const paymentApi = {
  methods: paymentMethodsApi,
  processing: paymentProcessingApi,
  customers: customerPaymentsApi,
  invoices: invoiceApi,
  reports: financialReportsApi,
  utils: paymentUtils
};

export default paymentApi;
