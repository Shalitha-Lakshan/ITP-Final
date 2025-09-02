const { PaymentTransaction, Invoice, PaymentMethod, PaymentAnalytics } = require('../Model/PaymentModel');

// Get all payment transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find()
      .populate('orderId', 'orderId')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await PaymentTransaction.findById(req.params.id)
      .populate('orderId')
      .populate('customerId', 'name email phone company');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new payment transaction
const createTransaction = async (req, res) => {
  try {
    const { orderId, customerId, customerName, amount, paymentMethod, paymentGateway } = req.body;
    
    // Generate transaction ID
    const transactionCount = await PaymentTransaction.countDocuments();
    const transactionId = `TXN${String(transactionCount + 1).padStart(6, '0')}`;

    // Calculate fees (example: 2.9% + $0.30 for credit cards)
    let processingFee = 0;
    let gatewayFee = 0;
    
    if (paymentMethod === 'Credit Card') {
      processingFee = amount * 0.029;
      gatewayFee = 0.30;
    } else if (paymentMethod === 'PayPal') {
      processingFee = amount * 0.034;
      gatewayFee = 0.49;
    }
    
    const totalFees = processingFee + gatewayFee;
    const netAmount = amount - totalFees;

    const newTransaction = new PaymentTransaction({
      transactionId,
      orderId,
      customerId,
      customerName,
      amount,
      paymentMethod,
      paymentGateway,
      fees: {
        processingFee,
        gatewayFee,
        totalFees
      },
      netAmount,
      status: 'Processing'
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { status, gatewayTransactionId, gatewayResponse, failureReason } = req.body;
    
    const updateData = { status };
    
    if (gatewayTransactionId) updateData.gatewayTransactionId = gatewayTransactionId;
    if (gatewayResponse) updateData.gatewayResponse = gatewayResponse;
    if (failureReason) updateData.failureReason = failureReason;
    if (status === 'Completed') updateData.processedAt = new Date();

    const transaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    
    const transaction = await PaymentTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only refund completed transactions' });
    }

    // Generate refund ID
    const refundCount = await PaymentTransaction.countDocuments({ 'refundDetails.refundId': { $exists: true } });
    const refundId = `REF${String(refundCount + 1).padStart(6, '0')}`;

    const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Refunded',
        refundDetails: {
          refundId,
          refundAmount,
          refundDate: new Date(),
          reason
        }
      },
      { new: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get payment analytics
const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await PaymentTransaction.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$amount', 0] }
          },
          totalPending: {
            $sum: { $cond: [{ $in: ['$status', ['Pending', 'Processing']] }, '$amount', 0] }
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, '$amount', 0] }
          },
          totalRefunded: {
            $sum: { $cond: [{ $eq: ['$status', 'Refunded'] }, '$refundDetails.refundAmount', 0] }
          },
          transactionCount: { $sum: 1 },
          averageTransactionValue: { $avg: '$amount' },
          totalFees: { $sum: '$fees.totalFees' }
        }
      }
    ]);

    // Get payment method breakdown
    const methodBreakdown = await PaymentTransaction.aggregate([
      { $match: { ...matchCondition, status: 'Completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly payment trends
    const monthlyTrends = await PaymentTransaction.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      summary: analytics[0] || {
        totalReceived: 0,
        totalPending: 0,
        totalFailed: 0,
        totalRefunded: 0,
        transactionCount: 0,
        averageTransactionValue: 0,
        totalFees: 0
      },
      methodBreakdown,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('orderId', 'orderId')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const { orderId, customerId, customerName, items, subtotal, taxAmount, discountAmount, dueDate, notes, terms } = req.body;
    
    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`;

    const totalAmount = subtotal + (taxAmount || 0) - (discountAmount || 0);

    const newInvoice = new Invoice({
      invoiceNumber,
      orderId,
      customerId,
      customerName,
      items,
      subtotal,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
      dueDate,
      notes,
      terms
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status, paidAmount } = req.body;
    
    const updateData = { status };
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount;
      if (status === 'Paid') {
        updateData.paidDate = new Date();
      }
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all payment methods
const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ isActive: true });
    res.status(200).json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new payment method
const createPaymentMethod = async (req, res) => {
  try {
    const newPaymentMethod = new PaymentMethod(req.body);
    const savedPaymentMethod = await newPaymentMethod.save();
    res.status(201).json(savedPaymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment method
const updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.status(200).json(paymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get finance overview data
const getFinanceOverview = async (req, res) => {
  try {
    const totalRevenue = await PaymentTransaction.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await PaymentTransaction.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$fees.totalFees' } } }
    ]);

    const paymentsReceived = await PaymentTransaction.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    const pendingPayments = await PaymentTransaction.aggregate([
      { $match: { status: { $in: ['Pending', 'Processing'] } } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      totalRevenue: totalRevenue[0]?.total || 0,
      netProfit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      paymentsReceived: paymentsReceived[0] || { count: 0, amount: 0 },
      pendingPayments: pendingPayments[0] || { count: 0, amount: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chart data
const getChartData = async (req, res) => {
  try {
    // Revenue vs Expenses by month
    const revenueExpenses = await PaymentTransaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$amount', 0] } },
          expenses: { $sum: '$fees.totalFees' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }
            ]
          },
          revenue: 1,
          expenses: 1
        }
      }
    ]);

    // Payment method breakdown
    const paymentMethods = await PaymentTransaction.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          value: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Employee salary expenses (mock data for now)
    const employeeSalaries = [
      { month: '2024-01', salaries: 150000, epf: 12000, etf: 4500, overtime: 8000 },
      { month: '2024-02', salaries: 155000, epf: 12400, etf: 4650, overtime: 9500 },
      { month: '2024-03', salaries: 160000, epf: 12800, etf: 4800, overtime: 7200 }
    ];

    res.status(200).json({
      revenueExpenses,
      paymentMethods: paymentMethods.map(pm => ({ name: pm._id, value: pm.value })),
      employeeSalaries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee management endpoints
const getAllEmployees = async (req, res) => {
  try {
    // Mock employee data - replace with actual Employee model
    const employees = [
      {
        _id: '1',
        employeeId: 'EMP001',
        name: 'John Doe',
        basicSalary: 50000,
        epfRate: 8,
        etfRate: 3,
        overtimeHours: 10,
        overtimeRate: 500,
        month: '2024-03'
      }
    ];
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    // Mock create - replace with actual Employee model
    const newEmployee = { _id: Date.now().toString(), ...req.body };
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    // Mock update - replace with actual Employee model
    res.status(200).json({ _id: req.params.id, ...req.body });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    // Mock delete - replace with actual Employee model
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Payment CRUD endpoints
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentTransaction.find()
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      transactionId: `PAY${Date.now()}`,
      createdAt: new Date()
    };
    const newPayment = new PaymentTransaction(paymentData);
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await PaymentTransaction.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  processRefund,
  getPaymentAnalytics,
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  getFinanceOverview,
  getChartData,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus
};
