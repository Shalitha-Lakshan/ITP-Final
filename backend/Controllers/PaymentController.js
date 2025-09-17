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
    const { orderId, customerName, amount, paymentMethod, status, notes, paymentDate } = req.body;
    
    // Generate a unique transaction ID
    const transactionId = `PAY${Date.now()}`;
    
    // Create payment data compatible with PaymentTransaction schema
    const paymentData = {
      transactionId,
      orderId: orderId || `ORD${Date.now()}`, // Generate order ID if not provided
      customerId: `CUST${Date.now()}`, // Generate customer ID (you might want to link to actual customer)
      customerName,
      amount: parseFloat(amount),
      currency: 'LKR',
      paymentMethod: paymentMethod === 'cash' ? 'Cash' : 
                    paymentMethod === 'card' ? 'Credit Card' :
                    paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                    paymentMethod === 'mobile_payment' ? 'PayPal' : 'Cash',
      paymentGateway: paymentMethod === 'cash' ? 'Cash' : 'Other',
      status: status === 'pending' ? 'Pending' :
              status === 'completed' ? 'Completed' :
              status === 'failed' ? 'Failed' : 'Pending',
      fees: {
        processingFee: 0,
        gatewayFee: 0,
        totalFees: 0
      },
      netAmount: parseFloat(amount),
      notes,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      createdAt: new Date()
    };
    
    const newPayment = new PaymentTransaction(paymentData);
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { orderId, customerName, amount, paymentMethod, status, notes, paymentDate } = req.body;
    
    // Create update data compatible with PaymentTransaction schema
    const updateData = {
      orderId: orderId || req.body.orderId,
      customerName,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod === 'cash' ? 'Cash' : 
                    paymentMethod === 'card' ? 'Credit Card' :
                    paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                    paymentMethod === 'mobile_payment' ? 'PayPal' : 'Cash',
      status: status === 'pending' ? 'Pending' :
              status === 'completed' ? 'Completed' :
              status === 'failed' ? 'Failed' : 'Pending',
      netAmount: parseFloat(amount),
      notes,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date()
    };
    
    const payment = await PaymentTransaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
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
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus
};
