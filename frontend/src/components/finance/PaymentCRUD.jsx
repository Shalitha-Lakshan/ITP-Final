import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, Download, FileText } from 'lucide-react';

const PaymentCRUD = () => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    amount: '',
    paymentMethod: 'cash',
    status: 'pending',
    transactionId: '',
    notes: '',
    paymentDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalType === 'edit' 
        ? `http://localhost:5000/api/finance/payments/${selectedPayment._id}`
        : 'http://localhost:5000/api/finance/payments';
      
      const method = modalType === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        await fetchPayments();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/finance/payments/${paymentId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchPayments();
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const openModal = (type, payment = null) => {
    setModalType(type);
    setSelectedPayment(payment);
    
    if (type === 'add') {
      setFormData({
        orderId: '',
        customerName: '',
        amount: '',
        paymentMethod: 'cash',
        status: 'pending',
        transactionId: '',
        notes: '',
        paymentDate: new Date().toISOString().slice(0, 10)
      });
    } else if (type === 'edit' && payment) {
      setFormData({
        ...payment,
        paymentDate: payment.paymentDate ? payment.paymentDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
    setModalType('add');
  };

  const exportPaymentHistory = () => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Amount (LKR)', 'Payment Method', 'Status', 'Transaction ID', 'Date', 'Notes'],
      ...payments.map(payment => [
        payment.orderId,
        payment.customerName,
        payment.amount,
        payment.paymentMethod,
        payment.status,
        payment.transactionId || '',
        new Date(payment.paymentDate).toLocaleDateString(),
        payment.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Payment Records Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={exportPaymentHistory}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => openModal('add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Payment ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-mono text-sm text-gray-900">PAY-{String(index + 1).padStart(4, '0')}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.customerName}</p>
                        <p className="text-sm text-gray-500">Order: {payment.orderId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">LKR {payment.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openModal('view', payment)}
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', payment)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {payments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment records found</p>
                <button
                  onClick={() => openModal('add')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first payment record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'add' ? 'Add New Payment' : 
                   modalType === 'edit' ? 'Edit Payment' : 'Payment Details'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order ID</label>
                      <p className="text-gray-900">{selectedPayment?.orderId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <p className="text-gray-900">{selectedPayment?.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-gray-900 font-semibold">LKR {selectedPayment?.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="text-gray-900">{selectedPayment?.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPayment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedPayment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedPayment?.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="text-gray-900">{selectedPayment?.transactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedPayment?.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="text-gray-900">
                        {new Date(selectedPayment?.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedPayment?.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPayment.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                      <input
                        type="text"
                        value={formData.orderId}
                        onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (LKR)</label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mobile_payment">Mobile Payment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                      <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Optional notes..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{modalType === 'edit' ? 'Update' : 'Save'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentCRUD;
