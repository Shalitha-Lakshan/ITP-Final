import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CreditCard, User, Phone, Mail, CheckCircle } from 'lucide-react';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Shipping Address removed
    
    // Payment Information
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // For non-card payment proofs
  const [paymentProof, setPaymentProof] = useState(null); // File
  const [paymentProofError, setPaymentProofError] = useState('');

  const [errors, setErrors] = useState({});

  // Load cart items
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [isAuthenticated, navigate]);

  const fetchCartItems = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      const userId = user.id || user._id;
      const response = await axios.get(`http://localhost:5000/api/cart?userId=${userId}`);
      const items = response.data.cartItems || [];
      
      if (items.length === 0) {
        navigate('/cart'); // Redirect to cart if empty
        return;
      }
      
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals (Tax and Shipping removed)
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = 0;
  const shipping = 0;
  const total = subtotal;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Apply input restrictions based on field type
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'cardName':
        // Only allow letters, spaces, and dots
        processedValue = value.replace(/[^A-Za-z\s.]/g, '');
        // Limit to 100 characters
        if (processedValue.length > 100) {
          processedValue = processedValue.substring(0, 100);
        }
        break;
        
      case 'email':
        // No special restrictions, but limit length
        if (value.length > 100) {
          processedValue = value.substring(0, 100);
        }
        break;
        
      case 'phone':
        // Only allow digits and format as user types
        let phoneDigits = value.replace(/\D/g, '');
        // Limit to 10 digits (Sri Lankan phone numbers)
        if (phoneDigits.length > 10) {
          phoneDigits = phoneDigits.substring(0, 10);
        }
        // Format as 071-234-5678
        if (phoneDigits.length > 6) {
          processedValue = `${phoneDigits.substring(0, 3)}-${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6)}`;
        } else if (phoneDigits.length > 3) {
          processedValue = `${phoneDigits.substring(0, 3)}-${phoneDigits.substring(3)}`;
        } else {
          processedValue = phoneDigits;
        }
        break;
        
      case 'cardNumber':
        // Only allow digits and spaces, format as user types
        const cardDigits = value.replace(/\D/g, '');
        // Limit to 19 digits (16 + 3 spaces)
        if (cardDigits.length > 16) {
          processedValue = cardDigits.substring(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
        } else {
          processedValue = cardDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
        break;
        
      case 'expiryDate':
        // Only allow digits and slash
        let digits = value.replace(/[^0-9/]/g, '');
        
        // Limit to 5 characters (MM/YY)
        if (digits.length > 5) {
          digits = digits.substring(0, 5);
        }
        
        // Handle month input (first two digits)
        if (digits.length <= 2) {
          // If first digit is 0, second digit can't be 0 (01-09)
          if (digits.length === 2 && digits.startsWith('0')) {
            if (digits[1] === '0') {
              // If user tries to type 00, prevent the second 0
              digits = '0';
            }
          }
          // If first digit is 1, second digit can only be 0, 1, or 2 (10, 11, 12)
          else if (digits.length === 2 && digits[0] === '1') {
            const secondDigit = digits[1];
            if (secondDigit !== '0' && secondDigit !== '1' && secondDigit !== '2') {
              // If user tries to type 13, 14, etc., prevent the second digit
              digits = '1';
            }
          }
          // If first digit is 2-9, check if the month would be > 12
          else if (digits.length === 2) {
            const month = parseInt(digits, 10);
            if (month > 12) {
              // If month would be > 12, prevent the second digit
              digits = digits[0];
            }
          }
        }
        
        // Auto-insert slash after 2 digits if not already present
        if (digits.length > 2 && !digits.includes('/')) {
          const month = digits.substring(0, 2);
          // Validate month (01-12)
          const monthNum = parseInt(month, 10);
          if (monthNum > 12) {
            digits = '12' + digits.substring(2);
          } else if (monthNum === 0) {
            digits = '01' + digits.substring(1);
          }
          // Insert slash after month
          digits = digits.substring(0, 2) + '/' + digits.substring(2);
        }
        
        // Handle year input (after slash)
        if (digits.includes('/') && digits.length > 3) {
          const [month, year] = digits.split('/');
          // If year starts with 0 and next digit is being entered, ensure it's not 0
          if (year.length === 1 && year === '0') {
            digits = month + '/0';
          }
          // Prevent 00 as year
          else if (year === '00') {
            digits = month + '/0';
          }
        }
        
        processedValue = digits;
        break;
        
      case 'cvv':
        // Only allow digits, limit to 3
        processedValue = value.replace(/\D/g, '').substring(0, 3);
        break;
        
      default:
        processedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear payment proof error when switching method
    if (name === 'paymentMethod') {
      setPaymentProofError('');
    }
  };

  const handlePaymentProofChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Allow images or PDF
      const ok = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!ok) {
        setPaymentProof(null);
        setPaymentProofError('Please upload an image or PDF file.');
        return;
      }
      setPaymentProof(file);
      setPaymentProofError('');
    } else {
      setPaymentProof(null);
    }
  };

  // Validation patterns
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const sriLankanPhoneRegex = /^0[1-9][0-9]{8}$/; // Matches 10 digits starting with 0
  const nameRegex = /^[A-Za-z\s.]{2,100}$/; // Only letters, spaces, and dots, 2-100 chars
  const cardNumberRegex = /^[0-9\s]{13,23}$/; // 13-19 digits with optional spaces
  const expiryDateRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/; // MM/YY format
  const isExpiryDateValid = (date) => {
    if (!expiryDateRegex.test(date)) return false;
    
    const [_, month, year] = date.match(expiryDateRegex);
    const monthNum = parseInt(month, 10);
    const yearNum = 2000 + parseInt(year, 10);
    
    // Check for invalid month (00 or > 12)
    if (monthNum === 0 || monthNum > 12) return false;
    
    // Check for invalid year (00)
    if (yearNum === 2000) return false;
    
    // Check if date is in the past
    const expiryDate = new Date(yearNum, monthNum, 0); // Last day of expiry month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return expiryDate >= today;
  };
  const cvvRegex = /^[0-9]{3}$/; // Exactly 3 digits
  const cardNameRegex = /^[A-Za-z\s.]{3,100}$/; // Cardholder name validation

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Personal Information Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (!nameRegex.test(formData.firstName.trim())) {
      newErrors.firstName = 'Name must contain only letters, spaces, and dots (2-100 characters)';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (!nameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = 'Name must contain only letters, spaces, and dots (2-100 characters)';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!sriLankanPhoneRegex.test(phoneDigits)) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., 0712345678)';
      isValid = false;
    }

    // Payment Information Validation
    if (formData.paymentMethod === 'card') {
      // Card Number
      const cardNumber = formData.cardNumber.replace(/\s+/g, '');
      if (!cardNumber) {
        newErrors.cardNumber = 'Card number is required';
        isValid = false;
      } else if (!/^[0-9]{13,19}$/.test(cardNumber)) {
        newErrors.cardNumber = 'Please enter a valid card number (13-19 digits)';
        isValid = false;
      }

      // Expiry date validation
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required (MM/YY)';
        isValid = false;
      } else if (!isExpiryDateValid(formData.expiryDate)) {
        if (formData.expiryDate === '00/00') {
          newErrors.expiryDate = 'Please enter a valid expiry date';
        } else if (formData.expiryDate.endsWith('/00')) {
          newErrors.expiryDate = 'Please enter a valid year';
        } else if (formData.expiryDate.startsWith('00/')) {
          newErrors.expiryDate = 'Please enter a valid month';
        } else if (formData.expiryDate.match(/^1[3-9]|2[0-9]|3[0-9]|0[0-9]/)) {
          newErrors.expiryDate = 'Please enter a valid month (01-12)';
        } else {
          newErrors.expiryDate = 'This card has expired';
        }
        isValid = false;
      }

      // CVV
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
        isValid = false;
      } else if (!cvvRegex.test(formData.cvv)) {
        newErrors.cvv = 'Please enter a valid 3-digit CVV';
        isValid = false;
      }

      // Cardholder Name
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
        isValid = false;
      } else if (!cardNameRegex.test(formData.cardName.trim())) {
        newErrors.cardName = 'Please enter a valid cardholder name';
        isValid = false;
      }
    } else {
      // Payment proof validation for non-card payments
      if (!paymentProof) {
        setPaymentProofError('Please upload payment proof (image or PDF)');
        newErrors.paymentProof = 'Payment proof required';
        isValid = false;
      } else if (paymentProof.size > 5 * 1024 * 1024) { // 5MB limit
        setPaymentProofError('File size should be less than 5MB');
        newErrors.paymentProof = 'File too large';
        isValid = false;
      } else {
        setPaymentProofError('');
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle order submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setOrderProcessing(true);
    
    try {
      const userId = user.id || user._id;

      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
      }

      // Build order payload for backend
      const orderPayload = {
        customerId: userId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        products: cartItems.map(item => ({
          productId: item.productId, // expects Product ObjectId/string
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        // optional fields supported by backend schema
        shippingAddress: undefined,
        notes: undefined,
      };

      const { data: savedOrder } = await axios.post('http://localhost:5000/api/sales/orders', orderPayload);

      // Use orderId generated by backend (human-readable) and persist payment info
      if (savedOrder?.orderId) {
        setOrderId(savedOrder.orderId);
      }

      // Map UI payment method to backend values
      const methodMap = {
        card: 'credit_card',
        bank: 'bank_transfer',
        mobile: 'mobile_payment'
      };
      const backendMethod = methodMap[formData.paymentMethod] || 'credit_card';

      // Update order payment info (method and optional proof)
      const orderMongoId = savedOrder?._id || savedOrder?.id; // endpoint expects Mongo _id
      if (orderMongoId) {
        try {
          if (backendMethod === 'bank_transfer' || backendMethod === 'mobile_payment') {
            const fd = new FormData();
            fd.append('paymentMethod', backendMethod);
            if (paymentProof) {
              fd.append('paymentProof', paymentProof);
            }
            await axios.put(`http://localhost:5000/api/sales/orders/${orderMongoId}/payment`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            await axios.put(`http://localhost:5000/api/sales/orders/${orderMongoId}/payment`, {
              paymentMethod: backendMethod
            });
          }
        } catch (err) {
          console.error('Failed to update payment info:', err?.response?.data || err);
        }
      }

      // Clear cart after successful order
      await axios.delete(`http://localhost:5000/api/cart/clear/${userId}`);
      window.dispatchEvent(new Event('cartUpdated'));

      setOrderComplete(true);
    } catch (error) {
      console.error('Error processing order:', error?.response?.data || error);
      const backendMessage = error?.response?.data?.message || error?.message || 'Failed to process order. Please try again.';
      alert(backendMessage);
    } finally {
      setOrderProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar forceWhiteBackground={true} />
        <div className="flex justify-center items-center py-20 pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar forceWhiteBackground={true} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">Thank you for your purchase. Your order has been successfully placed.</p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">Order ID: {orderId}</p>
              <p className="text-green-700 text-sm mt-1">You will receive a confirmation email shortly.</p>
            </div>
            <div className="space-y-3">
              <Link
                to="/products"
                className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="block w-full border border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar forceWhiteBackground={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/cart" 
            className="flex items-center text-green-600 hover:text-green-800 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={24} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address removed */}

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="mr-2" size={24} />
                  Payment Information
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Credit/Debit Card
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Bank Transfer
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mobile"
                        checked={formData.paymentMethod === 'mobile'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Mobile Payments
                    </label>
                  </div>
                </div>

                {formData.paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Payment Proof (Image or PDF) *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePaymentProofChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    {paymentProof && paymentProof.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(paymentProof)}
                        alt="Payment proof preview"
                        className="mt-2 w-40 h-40 object-cover rounded"
                      />
                    )}
                    {paymentProofError && (
                      <p className="text-red-500 text-xs mt-1">{paymentProofError}</p>
                    )}
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF.</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={orderProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {orderProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  `Place Order - LKR ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">
                      LKR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">LKR {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {/* Shipping and Tax removed */}
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Free shipping notice removed since shipping is disabled */}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default CheckoutPage;
