import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  User as UserIcon, Mail, Phone, MapPin, Shield, Eye, EyeOff, 
  Building, Users, Star, X
} from 'lucide-react';

// ---------- Memoized Subcomponents (defined outside) ----------
const InputField = React.memo(function InputField({
  label, name, type = 'text', icon: Icon, required = false, options = null,
  disabled = false, value, onChange, error, placeholder, min
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        )}
        {options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : ''
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            autoComplete="off"
          >
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : ''
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            autoComplete={type === 'email' ? 'email' : 'off'}
            inputMode={type === 'number' ? 'numeric' : 'text'}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const PasswordField = React.memo(function PasswordField({
  label, name, show, setShow, required = false, value, onChange, error, isEditing
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        {isEditing && <span className="text-gray-500 text-xs ml-2">(leave blank to keep current)</span>}
      </label>
      <div className="relative">
        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : ''
          }`}
          placeholder={isEditing ? 'Leave blank to keep current password' : `Enter ${label.toLowerCase()}`}
          autoComplete={name === 'password' ? 'new-password' : 'off'}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
});

// -------------------- Main Form --------------------
const UserManagementForm = ({ user = null, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Customer',
    status: 'Active',
    points: 0
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        username: user.username || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'Customer',
        status: user.status || 'Active',
        points: typeof user.points === 'number' ? user.points : 0
      });
    }
  }, [isEditing, user]);

  const roles = ['Collector', 'Customer'];
  const statusOptions = ['Active', 'Inactive'];

  // Stable handler (prevents remounts/focus loss in some setups)
  const handleInputChange = useCallback((e) => {
    const { name, value, type } = e.target;

    // Only convert numbers for number inputs; keep empty as '' to allow typing/clearing
    let finalValue = value;
    if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!isEditing && !formData.password) newErrors.password = 'Password is required';
    if (!isEditing && !formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.role === 'Customer' && Number(formData.points || 0) < 0) {
      newErrors.points = 'Points cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        id: isEditing ? user.id : Date.now(),
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        username: formData.username,
        role: formData.role,
        status: formData.status,
        points: formData.role === 'Customer' ? Number(formData.points || 0) : 0,
        createdDate: isEditing ? user.createdDate : new Date().toISOString().split('T')[0],
        lastLogin: isEditing ? user.lastLogin : 'Never'
      };
      if (formData.password) userData.password = formData.password;

      await onSubmit(userData);

      if (!isEditing) {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          address: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: 'Customer',
          status: 'Active',
          points: 0
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditing && user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        username: user.username || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'Customer',
        status: user.status || 'Active',
        points: typeof user.points === 'number' ? user.points : 0
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'Customer',
        status: 'Active',
        points: 0
      });
    }
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit User' : 'Add New User'}
        </h2>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <X size={16} />
          <span>Close</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="fullName"
                icon={UserIcon}
                required
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />
              <InputField
                label="Phone Number"
                name="phone"
                icon={Phone}
                placeholder="+94 71 234 5678"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
              />
              <InputField
                label="Address"
                name="address"
                icon={MapPin}
                placeholder="Enter full address"
                value={formData.address}
                onChange={handleInputChange}
                error={errors.address}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Username"
                name="username"
                icon={UserIcon}
                required
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                error={errors.username}
              />
              <InputField
                label="Role"
                name="role"
                icon={Building}
                options={roles}
                required
                value={formData.role}
                onChange={handleInputChange}
                error={errors.role}
              />
              <PasswordField
                label="Password"
                name="password"
                show={showPassword}
                setShow={setShowPassword}
                required={!isEditing}
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                isEditing={isEditing}
              />
              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                required={!isEditing}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                isEditing={isEditing}
              />
              <InputField
                label="Status"
                name="status"
                icon={Users}
                options={statusOptions}
                required
                value={formData.status}
                onChange={handleInputChange}
                error={errors.status}
              />
              {formData.role === 'Customer' && (
                <InputField
                  label="Points"
                  name="points"
                  type="number"
                  icon={Star}
                  min="0"
                  placeholder="0"
                  value={formData.points}
                  onChange={handleInputChange}
                  error={errors.points}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleReset} className="px-6 py-2">
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="px-6 py-2">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserManagementForm;
