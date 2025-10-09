          import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../common/LogoutButton";
import {
  LayoutDashboard,
  Factory,
  Package,
  Settings,
  TrendingUp,
  FileText,
  Search,
  Plus,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ShoppingCart,
  LogOut,
  PackagePlus,
  DollarSign,
} from "lucide-react";
 

const ProductionDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [acceptedMaterials, setAcceptedMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  // Pagination and filtering for Production Requests
  const [requestPage, setRequestPage] = useState(1);
  const [requestPageSize, setRequestPageSize] = useState(10);
  const [requestQuery, setRequestQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestForm, setRequestForm] = useState({
    team: '',
    requestedQty: '',
    notes: '',
    priority: 'Medium'
  });
  const [plans, setPlans] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    productName: '',
    productId: '',
    quantity: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Scheduled',
    notes: ''
  });
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [machineForm, setMachineForm] = useState({
    name: '',
    code: '',
    status: 'Idle',
    efficiency: '',
    lastMaintenance: '',
    notes: ''
  });
  const [qualityRecords, setQualityRecords] = useState([]);
  const [loadingQuality, setLoadingQuality] = useState(false);
  const [showQualityForm, setShowQualityForm] = useState(false);
  const [editingQuality, setEditingQuality] = useState(null);
  const [qualityForm, setQualityForm] = useState({
    batchNo: '',
    productId: '',
    productName: '',
    status: 'Passed',
    defects: '',
    defectCount: '',
    inspectionDate: '',
    inspector: '',
    notes: '',
    checks: { visual: true, dimensions: true, functional: true, packaging: true, safety: true },
    inspectedQuantity: '',
    planId: ''
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightLowStock, setHighlightLowStock] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [products, setProducts] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    imageUrl: "",
    description: "",
    category: "",
    points: "",
  });

  // Loyalty: points per 1 rupee setting (persisted in backend)
  const [pointsPerRupee, setPointsPerRupee] = useState("");
  const [pointsSavedAt, setPointsSavedAt] = useState("");

  // Load loyalty settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/points/settings');
        const rate = res.data?.settings?.pointsPerRupee;
        const updatedAt = res.data?.settings?.updatedAt;
        if (rate !== undefined) setPointsPerRupee(String(rate));
        if (updatedAt) setPointsSavedAt(updatedAt);
      } catch (err) {
        console.error('Failed to load loyalty settings', err);
      }
    };
    loadSettings();
  }, []);

  const handleSavePointsPerRupee = async (e) => {
    e.preventDefault();
    try {
      const body = { pointsPerRupee: Number(pointsPerRupee) };
      const res = await axios.post('http://localhost:5000/api/points/settings', body);
      const updatedAt = res.data?.settings?.updatedAt || new Date().toISOString();
      setPointsSavedAt(updatedAt);
      // Refresh products so updated points reflect in table
      await fetchProducts();
      alert(`Saved: points per 1 rupee updated. Products recalculated: ${res.data?.updatedProducts ?? 0}`);
    } catch (err) {
      console.error('Failed to save loyalty settings', err);
      alert('Failed to save loyalty settings. Please ensure the backend is running.');
    }
  };

  // Fetch quality records
  const fetchQualityRecords = async () => {
    try {
      setLoadingQuality(true);
      const res = await axios.get('http://localhost:5000/api/quality');
      const list = res.data?.records || [];
      setQualityRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching quality records:', err);
    } finally {
      setLoadingQuality(false);
    }
  };

  // Quality form handlers
  const handleQualityChange = (e) => {
    const { name, value } = e.target;
    // Field-level restrictions for Quality Records form
    if (name === 'productName') {
      // Allow only letters and spaces (no numbers or special characters)
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) return;
    } else if (name === 'inspectedQuantity') {
      // Digits only, maximum 4 characters
      const qtyRegex = /^\d{0,4}$/;
      if (!qtyRegex.test(value)) return;
    } else if (name === 'defects') {
      // Allow only letters, commas, and spaces (e.g., "scratch, color mismatch")
      const defectsRegex = /^[A-Za-z\s,]*$/;
      if (!defectsRegex.test(value)) return;
    } else if (name === 'defectCount') {
      // Digits only, up to 3 while typing
      const countRegex = /^\d{0,3}$/;
      if (!countRegex.test(value)) return;
    } else if (name === 'inspector') {
      // Letters and spaces only
      const inspRegex = /^[A-Za-z\s]*$/;
      if (!inspRegex.test(value)) return;
    }
    setQualityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQualityCheckToggle = (e) => {
    const { name, checked } = e.target;
    setQualityForm((prev) => ({
      ...prev,
      checks: { ...prev.checks, [name]: checked },
    }));
  };

  const handleQualityProductSelect = (e) => {
    const id = e.target.value;
    const prod = (products || []).find((p) => p._id === id);
    setQualityForm((prev) => ({
      ...prev,
      productId: id,
      productName: prod ? prod.name : prev.productName,
      // Auto-derive Batch No from selected product's Product ID (RIP-....)
      batchNo: prod?.productId ? String(prod.productId) : prev.batchNo,
    }));
  };

  const submitQuality = async (e) => {
    e.preventDefault();
    try {
      // Submit-time validation for Quality Records
      const nameOk = /^[A-Za-z\s]*$/.test(qualityForm.productName || '');
      if (!nameOk) {
        alert('Product Name can contain only letters and spaces.');
        return;
      }
      const qtyOk = /^\d{1,4}$/.test((qualityForm.inspectedQuantity || '').toString());
      if (qualityForm.inspectedQuantity && !qtyOk) {
        alert('Inspected Quantity must be digits only, up to 4 digits.');
        return;
      }
      const defectsOk = /^[A-Za-z\s,]*$/.test(qualityForm.defects || '');
      if (!defectsOk) {
        alert('Defects must contain only letters, commas, and spaces.');
        return;
      }
      const defectCountOk = /^\d{0,3}$/.test((qualityForm.defectCount || '').toString());
      if (!defectCountOk) {
        alert('Defect Count must be digits only, up to 3 digits.');
        return;
      }
      const inspectorOk = /^[A-Za-z\s]*$/.test(qualityForm.inspector || '');
      if (!inspectorOk) {
        alert('Inspector can contain only letters and spaces.');
        return;
      }

      // Determine batch number from selected product's Product ID (e.g., RIP-0001)
      const selectedProd = (products || []).find((p) => p._id === qualityForm.productId);
      const batchNoVal = selectedProd?.productId ? String(selectedProd.productId) : qualityForm.batchNo.trim();

      const payload = {
        batchNo: batchNoVal,
        productId: qualityForm.productId || undefined,
        productName: qualityForm.productName?.trim() || undefined,
        status: qualityForm.status,
        defects: qualityForm.defects,
        defectCount: qualityForm.defectCount ? parseInt(qualityForm.defectCount) : 0,
        inspectionDate: qualityForm.inspectionDate || undefined,
        inspector: qualityForm.inspector.trim(),
        notes: qualityForm.notes?.trim() || '',
        inspectedQuantity: qualityForm.inspectedQuantity ? parseInt(qualityForm.inspectedQuantity) : 0,
        planId: qualityForm.planId || undefined,
        checks: {
          visual: !!qualityForm.checks?.visual,
          dimensions: !!qualityForm.checks?.dimensions,
          functional: !!qualityForm.checks?.functional,
          packaging: !!qualityForm.checks?.packaging,
          safety: !!qualityForm.checks?.safety,
        }
      };
      let res;
      if (editingQuality) {
        res = await axios.put(`http://localhost:5000/api/quality/${editingQuality._id}`, payload);
      } else {
        res = await axios.post('http://localhost:5000/api/quality', payload);
      }
      const saved = res.data?.record;
      if (saved) {
        setQualityRecords((prev) => editingQuality ? prev.map(r => r._id === saved._id ? saved : r) : [saved, ...prev]);
      } else {
        await fetchQualityRecords();
      }
      setEditingQuality(null);
      setShowQualityForm(false);
      setQualityForm({ batchNo: '', productId: '', productName: '', status: 'Passed', defects: '', defectCount: '', inspectionDate: '', inspector: '', notes: '', checks: { visual: true, dimensions: true, functional: true, packaging: true, safety: true }, inspectedQuantity: '', planId: '' });
      alert(`Quality record ${editingQuality ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('submitQuality error', err);
      alert('Failed to save quality record');
    }
  };

  const editQuality = (rec) => {
    setEditingQuality(rec);
    setQualityForm({
      batchNo: rec.batchNo || '',
      productId: rec.productId?._id || '',
      productName: rec.productName || '',
      status: rec.status || 'Passed',
      defects: (rec.defects || []).join(', '),
      defectCount: (rec.defectCount ?? '').toString(),
      inspectionDate: rec.inspectionDate ? new Date(rec.inspectionDate).toISOString().slice(0,10) : '',
      inspector: rec.inspector || '',
      notes: rec.notes || '',
      inspectedQuantity: (rec.inspectedQuantity ?? '').toString(),
      planId: rec.planId || '',
      checks: {
        visual: rec.checks?.visual ?? true,
        dimensions: rec.checks?.dimensions ?? true,
        functional: rec.checks?.functional ?? true,
        packaging: rec.checks?.packaging ?? true,
        safety: rec.checks?.safety ?? true,
      }
    });
    setShowQualityForm(true);
  };

  const deleteQuality = async (id) => {
    if (!window.confirm('Delete this quality record?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/quality/${id}`);
      setQualityRecords((prev) => prev.filter((r) => r._id !== id));
      alert('Quality record deleted');
    } catch (err) {
      console.error('deleteQuality error', err);
      alert('Failed to delete quality record');
    }
  };

  // Fetch production plans
  const fetchProductionPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get('http://localhost:5000/api/production-plans');
      const list = response.data?.plans || [];
      setPlans(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching production plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch machines
  const fetchMachines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/machines');
      const list = response.data?.machines || [];
      setMachines(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  // CRUD: Production Plans
  const handlePlanFormChange = (e) => {
    const { name, value } = e.target;
    // Field-level restrictions
    if (name === 'productName') {
      // Only letters and spaces
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) return;
    }
    if (name === 'quantity') {
      // Only digits, max 4 (no minus, plus, letters, or special chars)
      const qtyRegex = /^\d{0,4}$/;
      if (!qtyRegex.test(value)) return;
    }
    if (name === 'startDate') {
      // Build local yyyy-mm-dd (avoid UTC offset issues)
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const ymdToday = `${y}-${m}-${day}`;
      if (value && value < ymdToday) {
        return setPlanForm((prev) => ({ ...prev, [name]: ymdToday }));
      }
    }
    setPlanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanProductSelect = (e) => {
    const id = e.target.value;
    const prod = (products || []).find((p) => p._id === id);
    setPlanForm((prev) => ({
      ...prev,
      productId: id,
      productName: prod ? prod.name : prev.productName,
    }));
  };

  const submitPlan = async (e) => {
    e.preventDefault();
    try {
      // Submit-time validation
      const qtyNum = planForm.quantity ? parseInt(planForm.quantity, 10) : 0;
      if (!qtyNum || qtyNum <= 0) {
        alert('Quantity must be a positive number');
        return;
      }
      if (qtyNum > 9999) {
        alert('Quantity cannot exceed 4 digits (max 9999)');
        return;
      }
      const todayStr = new Date().toISOString().slice(0,10);
      if (planForm.startDate && planForm.startDate < todayStr) {
        alert('Start Date cannot be a previous day');
        return;
      }

      const payload = {
        productName: planForm.productName?.trim() || undefined,
        productId: planForm.productId || undefined,
        quantity: qtyNum,
        startDate: planForm.startDate || undefined,
        endDate: planForm.endDate || undefined,
        priority: planForm.priority,
        status: planForm.status,
        notes: planForm.notes?.trim() || ''
      };
      let res;
      if (editingPlan) {
        res = await axios.put(`http://localhost:5000/api/production-plans/${editingPlan._id}`, payload);
      } else {
        res = await axios.post('http://localhost:5000/api/production-plans', payload);
      }
      const saved = res.data?.plan;
      if (saved) {
        if (editingPlan) {
          setPlans((prev) => prev.map((p) => (p._id === editingPlan._id ? saved : p)));
        } else {
          setPlans((prev) => [saved, ...prev]);
        }
      } else {
        await fetchProductionPlans();
      }
      setEditingPlan(null);
      setPlanForm({ productName: '', productId: '', quantity: '', startDate: '', endDate: '', priority: 'Medium', status: 'Scheduled', notes: '' });
      setShowPlanForm(false);
      alert(`Plan ${editingPlan ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('submitPlan error', err);
      alert('Failed to save plan');
    }
  };

  const editPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      productName: plan.productName || '',
      productId: plan.productId?._id || '',
      quantity: plan.quantity?.toString() || '',
      startDate: plan.startDate ? new Date(plan.startDate).toISOString().slice(0,10) : '',
      endDate: plan.endDate ? new Date(plan.endDate).toISOString().slice(0,10) : '',
      priority: plan.priority || 'Medium',
      status: plan.status || 'Scheduled',
      notes: plan.notes || ''
    });
    setShowPlanForm(true);
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/production-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      alert('Plan deleted');
    } catch (err) {
      console.error('deletePlan error', err);
      alert('Failed to delete plan');
    }
  };

  const goToQuality = (plan) => {
    const prodId = plan.productId?._id || '';
    const prodName = plan.productName || '';
    // Prefer product's Product ID (RIP-....) for Batch No when available
    const linkedProduct = (products || []).find((p) => p._id === prodId);
    const batchNo = linkedProduct?.productId ? String(linkedProduct.productId) : (plan._id ? `PLAN-${String(plan._id).slice(-6).toUpperCase()}` : new Date().toISOString().slice(0,10));
    setActiveTab('quality');
    setShowQualityForm(true);
    setEditingQuality(null);
    setQualityForm({
      batchNo,
      productId: prodId,
      productName: prodName,
      status: 'Passed',
      defects: '',
      defectCount: '',
      inspectionDate: new Date().toISOString().slice(0,10),
      inspector: '',
      notes: `QC for plan ${batchNo}`,
      checks: { visual: true, dimensions: true, functional: true, packaging: true, safety: true },
      inspectedQuantity: plan.quantity ? String(plan.quantity) : '',
      planId: plan._id || ''
    });
  };

  const completePlan = async (plan) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/production-plans/${plan._id}`, { status: 'Completed' });
      const updated = res.data?.plan || null;
      if (updated) {
        setPlans((prev) => prev.map((p) => (p._id === plan._id ? updated : p)));
      } else {
        await fetchProductionPlans();
      }
      alert('Plan marked as Completed.');

      // Jump to Quality form prefilled for this plan
      goToQuality(updated || plan);
    } catch (err) {
      console.error('completePlan error', err);
      alert('Failed to complete plan');
    }
  };

  // CRUD: Machines
  const handleMachineFormChange = (e) => {
    const { name, value } = e.target;
    // Field-level typing restrictions
    if (name === 'name') {
      // Allow letters, numbers, spaces, - _ # ( ) up to 50 chars
      const next = value.slice(0, 50);
      const nameRegex = /^[A-Za-z0-9 \-_#()]*$/;
      if (!nameRegex.test(next)) return;
      setMachineForm((prev) => ({ ...prev, [name]: next }));
      return;
    }
    if (name === 'code') {
      // Uppercase letters, numbers, dash, underscore only, up to 10 chars
      const next = (value || '').toUpperCase().slice(0, 10);
      const codeRegex = /^[A-Z0-9\-_]*$/;
      if (!codeRegex.test(next)) return;
      setMachineForm((prev) => ({ ...prev, [name]: next }));
      return;
    }
    if (name === 'efficiency') {
      // Digits only while typing; allow empty; max 3 digits to allow 100
      const effRegex = /^\d{0,3}$/;
      if (!effRegex.test(String(value))) return;
      // Clamp to 100 while typing if user enters more than 100
      if (value === '') {
        setMachineForm((prev) => ({ ...prev, [name]: '' }));
      } else {
        const n = parseInt(String(value), 10);
        const clamped = n > 100 ? 100 : n;
        setMachineForm((prev) => ({ ...prev, [name]: String(clamped) }));
      }
      return;
    }
    if (name === 'lastMaintenance') {
      // Prevent future date on change
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const ymdToday = `${y}-${m}-${d}`;
      if (value && value > ymdToday) return;
      setMachineForm((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name === 'notes') {
      const next = value.slice(0, 200);
      setMachineForm((prev) => ({ ...prev, [name]: next }));
      return;
    }
    setMachineForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitMachine = async (e) => {
    e.preventDefault();
    try {
      // Validations per spec
      const nameTrim = (machineForm.name || '').trim();
      const codeTrim = (machineForm.code || '').trim().toUpperCase();
      const nameRegex = /^[A-Za-z0-9 \-_#()]{3,50}$/;
      const codeRegex = /^[A-Z0-9\-_]{3,10}$/;

      if (!nameTrim || !nameRegex.test(nameTrim)) {
        alert('Name is required (3–50 chars). Allowed: letters, numbers, spaces, - _ # ( )');
        return;
      }
      if (!codeTrim || !codeRegex.test(codeTrim)) {
        alert('Code is required (3–10 chars). Allowed: uppercase letters, numbers, dash, underscore.');
        return;
      }
      // Uniqueness: code must be unique among machines (allow self when editing)
      const duplicate = (machines || []).some(m => String(m.code).toUpperCase() === codeTrim && (!editingMachine || m._id !== editingMachine._id));
      if (duplicate) {
        alert('Machine Code must be unique. This code already exists.');
        return;
      }

      const allowedStatuses = ['Idle','Running','Stopped','Maintenance'];
      if (!allowedStatuses.includes(machineForm.status)) {
        alert('Status is required. Choose one of: Idle, Running, Stopped, Maintenance.');
        return;
      }

      // Efficiency required between 1 and 100
      const effNum = parseInt(String(machineForm.efficiency), 10);
      if (Number.isNaN(effNum) || effNum < 1 || effNum > 100) {
        alert('Efficiency (%) is required and must be a number between 1 and 100.');
        return;
      }

      // Last Maintenance required and not in the future
      if (!machineForm.lastMaintenance) {
        alert('Last Maintenance date is required.');
        return;
      }
      const sel = new Date(machineForm.lastMaintenance);
      const today = new Date();
      const norm = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (norm(sel) > norm(today)) {
        alert('Last Maintenance cannot be a future date.');
        return;
      }

      // Notes: optional max 200 enforced by handler
      const payload = {
        name: nameTrim,
        code: codeTrim,
        status: machineForm.status,
        efficiency: effNum,
        lastMaintenance: machineForm.lastMaintenance || undefined,
        notes: machineForm.notes?.trim() || ''
      };
      let res;
      if (editingMachine) {
        res = await axios.put(`http://localhost:5000/api/machines/${editingMachine._id}`, payload);
      } else {
        res = await axios.post('http://localhost:5000/api/machines', payload);
      }
      const saved = res.data?.machine;
      if (saved) {
        if (editingMachine) {
          setMachines((prev) => prev.map((m) => (m._id === editingMachine._id ? saved : m)));
        } else {
          setMachines((prev) => [saved, ...prev]);
        }
      } else {
        await fetchMachines();
      }
      setEditingMachine(null);
      setMachineForm({ name: '', code: '', status: 'Idle', efficiency: '', lastMaintenance: '', notes: '' });
      setShowMachineForm(false);
      alert(`Machine ${editingMachine ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('submitMachine error', err);
      alert(err?.response?.data?.message || 'Failed to save machine');
    }
  };

  const editMachine = (machine) => {
    setEditingMachine(machine);
    setMachineForm({
      name: machine.name || '',
      code: machine.code || '',
      status: machine.status || 'Idle',
      efficiency: (machine.efficiency ?? '').toString(),
      lastMaintenance: machine.lastMaintenance ? new Date(machine.lastMaintenance).toISOString().slice(0,10) : '',
      notes: machine.notes || ''
    });
    setShowMachineForm(true);
  };

  const deleteMachine = async (id) => {
    if (!window.confirm('Delete this machine?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/machines/${id}`);
      setMachines((prev) => prev.filter((m) => m._id !== id));
      alert('Machine deleted');
    } catch (err) {
      console.error('deleteMachine error', err);
      alert('Failed to delete machine');
    }
  };

  // Generate unique Product ID starting from RIP-0001 and incrementing
  const generateUniqueProductId = () => {
    const ids = (products || [])
      .map(p => String(p.productId || ''))
      .map(id => {
        const m = id.match(/^RIP-(\d{4})$/);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter(n => n !== null);

    const existingSet = new Set(ids);
    let next = 1;
    if (ids.length > 0) {
      const max = Math.max(...ids);
      next = max + 1;
    }

    // If exceeded 9999, find first available gap from 1..9999
    if (next > 9999) {
      next = 1;
      while (next <= 9999 && existingSet.has(next)) next++;
      if (next > 9999) {
        // As a last resort, fallback to a timestamp-based suffix (still numeric) trimmed to 4 digits
        const ts = Date.now() % 10000;
        next = ts === 0 ? 1 : ts;
      }
    }

    return `RIP-${String(next).padStart(4, '0')}`;
  };

  

  // Sample data (replace with API calls later)
  const overview = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock < 50).length,
    totalValue: products
      .reduce((sum, p) => sum + p.price * p.stock, 0)
      .toFixed(2),
    avgPrice: (
      products.reduce((sum, p) => sum + p.price, 0) / products.length
    ).toFixed(2),
  };

  // Approved materials metrics
  const approvedRequestsCount = Array.isArray(acceptedMaterials) ? acceptedMaterials.length : 0;
  const approvedTotalQty = Array.isArray(acceptedMaterials)
    ? acceptedMaterials.reduce((sum, r) => sum + (parseFloat(r?.requestedQty) || 0), 0)
    : 0;

  const rawMaterials = [
    { name: "Rice (Mixed)", qty: 50, weight: "5kg" },
    { name: "Bottle (Mixed)", qty: 200, weight: "50kg" },
    { name: "Hi (Clear)", qty: 0, weight: "5kg" },
    { name: "Clear PET Bottles", qty: 50000, weight: "1250.5kg" },
    { name: "Green HDPE Bottles", qty: 35000, weight: "890.2kg" },
  ];

  // Derived: filtered and paginated production requests
  const filteredRequests = (requests || []).filter((r) => {
    if (!requestQuery) return true;
    const q = requestQuery.toLowerCase();
    return (
      String(r.requestId || r._id || '').toLowerCase().includes(q) ||
      String(r.team || '').toLowerCase().includes(q) ||
      String(r.priority || '').toLowerCase().includes(q) ||
      String(r.status || '').toLowerCase().includes(q) ||
      String(r?.inventoryItemId?.name || '').toLowerCase().includes(q)
    );
  });
  const totalRequestPages = Math.max(1, Math.ceil(filteredRequests.length / requestPageSize) || 1);
  const currentRequestPage = Math.min(requestPage, totalRequestPages);
  const pagedRequests = filteredRequests.slice(
    (currentRequestPage - 1) * requestPageSize,
    currentRequestPage * requestPageSize
  );

  useEffect(() => {
    // Reset to first page when filters or data change
    setRequestPage(1);
  }, [requestQuery, requestPageSize, requests]);

  // Filtered products by search
  const filteredProducts = products.filter((p) =>
    String(p.name || '').toLowerCase().startsWith(searchTerm.toLowerCase().trim())
  );

  // Analytics visualizations have been moved to a dedicated page.

  const recentActivity = [
    { type: "Production", detail: "100 units of Recycled PET Filament completed" },
    { type: "Quality Check", detail: "Batch #2024-001 passed inspection" },
    { type: "Inventory", detail: "Raw materials restocked - 500kg PET bottles" },
    { type: "Maintenance", detail: "Machine #3 scheduled for maintenance" },
  ];

  const menuItems = [
    { name: "Overview", key: "overview", icon: <LayoutDashboard size={20} /> },
    { name: "Products", key: "products", icon: <ShoppingCart size={20} /> },
    { name: "Production Planning", key: "planning", icon: <Factory size={20} /> },
    { name: "Raw Materials", key: "materials", icon: <Package size={20} /> },
    { name: "Quality Control", key: "quality", icon: <Settings size={20} /> },
    { name: "Analytics", key: "analytics", icon: <TrendingUp size={20} /> },
    { name: "Reports", key: "reports", icon: <FileText size={20} /> },
  ];
  

  // Planning and machines are fetched from backend now

  const qualityMetrics = [
    { metric: "Defect Rate", value: "2.1%", target: "< 3%", status: "Good" },
    { metric: "First Pass Yield", value: "94.5%", target: "> 90%", status: "Excellent" },
    { metric: "Customer Satisfaction", value: "4.7/5", target: "> 4.5", status: "Excellent" },
    { metric: "On-time Delivery", value: "96.2%", target: "> 95%", status: "Good" },
  ];

  // Machine status loaded from backend

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create production request
  const createProductionRequest = async () => {
    try {
      // First check if backend server is running
      try {
        await axios.get('http://localhost:5000/api/health');
      } catch (healthError) {
        alert('Backend server is not running. Please start the backend server first.');
        return;
      }

      const requestData = {
        team: requestForm.team,
        inventoryItemId: selectedItem._id,
        requestedQty: parseInt(requestForm.requestedQty),
        notes: requestForm.notes,
        priority: requestForm.priority,
        status: 'Pending'
      };

      console.log('Sending request data:', requestData);
      console.log('Selected item:', selectedItem);
      
      const response = await axios.post('http://localhost:5000/api/production-requests', requestData);
      console.log('Request response:', response.data);
      
      // Reset form and close modal
      setRequestForm({ team: '', requestedQty: '', notes: '', priority: 'Medium' });
      setShowRequestModal(false);
      setSelectedItem(null);
      
      alert('Production request created successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request data that failed:', {
        team: requestForm.team,
        inventoryItemId: selectedItem?._id,
        requestedQty: requestForm.requestedQty,
        notes: requestForm.notes,
        priority: requestForm.priority
      });
      
      let errorMessage = 'Failed to create production request. ';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to backend server. Please ensure the backend server is running on port 5000.';
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data?.message || 'Invalid request data.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Inventory item not found.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check the console for more details and try again.';
      }
      
      alert(errorMessage);
    }
  };

  // Handle request form changes
  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    // Team/Department: letters and spaces only
    if (name === 'team') {
      const teamRegex = /^[A-Za-z\s]*$/;
      if (!teamRegex.test(value)) return;
      setRequestForm(prev => ({ ...prev, [name]: value }));
      return;
    }
    // Requested Quantity: digits only; clamp 1..selectedItem.stock
    if (name === 'requestedQty') {
      const qtyRegex = /^\d*$/;
      if (!qtyRegex.test(String(value))) return;
      let next = value === '' ? '' : String(parseInt(value, 10));
      if (next !== '') {
        let num = parseInt(next, 10);
        if (Number.isNaN(num) || num < 1) num = 1;
        const max = selectedItem?.stock ?? Infinity;
        if (num > max) num = max;
        next = String(num);
      }
      setRequestForm(prev => ({ ...prev, [name]: next }));
      return;
    }
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  // Open request modal
  const openRequestModal = (item) => {
    setSelectedItem(item);
    setShowRequestModal(true);
  };

  // Fetch accepted materials
  const fetchAcceptedMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/production-requests/status/Approved');
      setAcceptedMaterials(response.data);
    } catch (error) {
      console.error('Error fetching accepted materials:', error);
    }
  };

  // Fetch ALL production requests (for table display)
  const fetchProductionRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/production-requests');
      setRequests(Array.isArray(response.data) ? response.data : (response.data?.requests || []));
    } catch (error) {
      console.error('Error fetching production requests:', error);
    }
  };

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      console.log('Fetching products from database...');
      const response = await axios.get('http://localhost:5000/api/products');
      console.log('Products response:', response.data);
      
      if (response.data.products) {
        setProducts(response.data.products);
        console.log('Products loaded:', response.data.products.length, 'items');
      } else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        console.log('Products loaded:', response.data.length, 'items');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error response:', error.response?.data);
      // Don't show alert for fetch errors, just log them
    }
  };

  // Sync activeTab with URL query (?tab=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Load data when component mounts and when tabs change
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'materials') {
      fetchInventoryData();
      fetchAcceptedMaterials();
      fetchProductionRequests();
    } else if (activeTab === 'overview') {
      // Keep key metrics fresh on the dashboard
      fetchProducts();
      fetchAcceptedMaterials();
    } else if (activeTab === 'planning') {
      // Ensure we have latest products for the dropdown
      fetchProducts();
      fetchProductionPlans();
      fetchMachines();
    } else if (activeTab === 'quality') {
      fetchProducts();
      fetchQualityRecords();
    }
  }, [activeTab]);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation logic
    if (name === 'name') {
      // Product Name: only letters and spaces, no numbers or special characters
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) {
        return; // Don't update if invalid
      }
    } else if (name === 'price') {
      // Price: allow up to 4 integer digits and up to 2 decimal digits while typing
      // Keep thousands separators on integer part, allow trailing dot
      const raw = String(value).replace(/[^0-9.]/g, '');
      const parts = raw.split('.');
      const intPart = (parts[0] || '').slice(0, 4);
      const fracPart = (parts[1] || '').slice(0, 2);
      const intFormatted = intPart ? Number(intPart).toLocaleString('en-US') : '';
      const formatted = parts.length > 1 ? `${intFormatted}${fracPart !== '' ? '.' + fracPart : '.'}` : intFormatted;
      setNewProduct((prev) => ({ ...prev, price: formatted }));
      return;
    } else if (name === 'stock') {
      // Stock Level: only digits, up to 4 characters
      const stockRegex = /^\d{0,4}$/;
      if (!stockRegex.test(value)) {
        return; // Block letters, special chars, or more than 4 digits
      }
    }
    
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Ensure price shows two decimals on blur (preserve cents typed)
  const handlePriceBlur = () => {
    const raw = String(newProduct.price || '').replace(/,/g, '');
    const m = raw.match(/^(\d{1,4})(?:\.(\d{0,2}))?$/);
    const intPart = m ? m[1] : '';
    let fracPart = m ? (m[2] || '') : '';
    if (!intPart) {
      setNewProduct((prev) => ({ ...prev, price: '' }));
      return;
    }
    fracPart = (fracPart + '00').slice(0, 2);
    const num = Number(`${intPart}.${fracPart}`);
    const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setNewProduct((prev) => ({ ...prev, price: formatted }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Edit Product
  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      category: product.category || '',
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${productId}`);
      
      if (response.status === 200) {
        // Refresh products list
        await fetchProducts();
        alert('Product deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Add or Update product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', newProduct);
    
    // Validate required fields
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Please fill in all required fields: Product Name, Price, and Category');
      return;
    }

    try {
      // First check if backend server is running
      try {
        await axios.get('http://localhost:5000/api/health');
        console.log('Backend server is running');
      } catch (healthError) {
        alert('Backend server is not running. Please start the backend server first.');
        return;
      }

      const priceNumber = Number(String(newProduct.price || '').replace(/,/g, ''));
      const productData = {
        name: newProduct.name.trim(),
        price: priceNumber,
        stock: parseInt(newProduct.stock) || 0,
        imageUrl: newProduct.imageUrl || '',
        description: newProduct.description?.trim() || '',
        category: newProduct.category,
        points: newProduct.points ? parseInt(newProduct.points) : 0,
      };

      console.log('Sending product data:', productData);

      let response;
      if (editingProduct) {
        // Update existing product
        response = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, productData);
      } else {
        // Create new product
        response = await axios.post('http://localhost:5000/api/products', productData);
      }
      
      console.log('Server response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        // Update products list in-place to preserve order (append new, update existing)
        if (editingProduct) {
          const updated = response.data?.product || response.data;
          setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? { ...p, ...updated } : p)));
        } else {
          const created = response.data?.product || response.data;
          if (created) {
            // Append new product to the end so it shows after previous items
            setProducts((prev) => [...prev, created]);
          } else {
            // Fallback: refresh from server if response format is unknown
            await fetchProducts();
          }
        }
        
        // Reset form
        setNewProduct({
          name: "",
          price: "",
          stock: "",
          imageUrl: "",
          description: "",
          category: "",
          points: "",
        });
        setEditingProduct(null);
        setShowAddForm(false);
        
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        alert('Invalid product data. Please check your inputs.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert(`Failed to ${editingProduct ? 'update' : 'create'} product. Please check if the backend server is running.`);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Factory className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Production Hub</h2>
              <p className="text-sm text-gray-500">Manufacturing Operations</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            item.key === 'reports' ? (
              <Link
                key={item.key}
                to="/production/reports"
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ) : item.key === 'analytics' ? (
              <Link
                key={item.key}
                to="/production/analytics"
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-gray-700 hover:bg-gray-100`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); navigate(`/production?tab=${item.key}`); }}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.key
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            )
          ))}
          <LogoutButton />
        </nav>

        
      </aside>


      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
              <p className="text-gray-600 mt-1">Manufacturing operations and inventory management</p>
            </div>
            <div className="flex space-x-3"></div>
          </div>
        </header>

        <div className="p-6">
          {/* Render Content Based on Active Tab */}
          {activeTab === "overview" && (
            <>
              {/* Enhanced Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Products</p>
                  <h2 className="text-3xl font-bold">{overview.totalProducts}</h2>
                  <p className="text-emerald-100 text-sm mt-1">Active inventory</p>
                </div>
                <Package size={40} className="text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Value</p>
                  <h2 className="text-3xl font-bold">LKR {Number(overview.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  <p className="text-blue-100 text-sm mt-1">Inventory worth</p>
                </div>
                <DollarSign size={40} className="text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Production Rate</p>
                  <h2 className="text-3xl font-bold">95%</h2>
                  <p className="text-purple-100 text-sm mt-1">Efficiency</p>
                </div>
                <TrendingUp size={40} className="text-purple-200" />
              </div>
            </div>

            <div
              className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => { setActiveTab('products'); setHighlightLowStock(true); setTimeout(() => setHighlightLowStock(false), 6000); }}
              title="View low stock products"
              role="button"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Low Stock Items</p>
                  <h2 className="text-3xl font-bold">{overview.lowStock}</h2>
                  <p className="text-orange-100 text-sm mt-1">Need attention</p>
                </div>
                <AlertTriangle size={40} className="text-orange-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved Raw Materials</p>
                  <h2 className="text-3xl font-bold">{approvedRequestsCount}</h2>
                  <p className="text-green-100 text-sm mt-1">Stock(Kg): {approvedTotalQty}</p>
                </div>
                <CheckCircle size={40} className="text-green-200" />
              </div>
            </div>
          </div>

          {/* Featured Products (first 8 items) */}
          <div className="mt-8 bg-white shadow rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Featured Products</h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition"
              >
                View All Products
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No products available yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((p, idx) => (
                  <div key={p._id || idx} className="group border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-shadow">
                    <div className="relative h-40 bg-gray-50 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={36} />
                        </div>
                      )}
                      <div className={`${p.stock < 10 ? 'bg-red-100 text-red-700' : p.stock < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium`}>
                        {p.stock < 10 ? 'Out of Stock' : p.stock < 50 ? 'Low Stock' : 'In Stock'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 truncate pr-2" title={p.name}>{p.name}</h4>
                        <span className="text-green-600 font-bold text-sm">LKR {parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Product ID: {p.productId || (p._id ? `RIP-${(p._id + '').replace(/\\D/g,'').slice(-4).padStart(4,'0')}` : '-')}</div>
                      <div className="mt-3 flex items-center gap-2">
                        {(() => {
                          const price = parseFloat(p.price);
                          const rate = parseFloat(pointsPerRupee || '0');
                          if (Number.isNaN(price) || Number.isNaN(rate) || rate <= 0) return null;
                          const points = Math.round(price * rate);
                          return (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                              ⭐ {points} pts
                            </span>
                          );
                        })()}
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {p.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts moved to Analytics page. */}

          {/* Raw Materials + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Raw Materials</h3>
              <ul className="space-y-2">
                {rawMaterials.map((m, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between border-b pb-2 text-sm text-gray-600"
                  >
                    <span>{m.name}</span>
                    <span>
                      {m.qty} ({m.weight})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white shadow rounded-2xl p-4">
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <ul className="space-y-2">
                {recentActivity.map((a, idx) => (
                  <li
                    key={idx}
                    className="text-sm border-b pb-2 text-gray-600"
                  >
                    <span className="font-semibold text-gray-800">
                      {a.type}:{" "}
                    </span>
                    {a.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

            </>
          )}

          {activeTab === 'products' && (
            <>
              {showAddForm && (
                <div className="bg-white shadow rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4">{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Product Name *</label>
                        <input type="text" name="name" value={newProduct.name} onChange={handleChange} pattern="^[A-Za-z\s]+$" title="Only letters and spaces are allowed - no numbers or special characters" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter product name (letters and spaces only)" />
                        {newProduct.name && !/^[A-Za-z\s]*$/.test(newProduct.name) && (<p className="text-red-500 text-xs mt-1">Product name can only contain letters and spaces</p>)}
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Unit Price (LKR)</label>
                        <input
                          type="text"
                          name="price"
                          value={newProduct.price}
                          onChange={handleChange}
                          inputMode="numeric"
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 1,000"
                          title="Digits only, auto-formatted with commas (max 4 digits: up to 9,999)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Stock Level</label>
                        <input
                          type="text"
                          name="stock"
                          value={newProduct.stock}
                          onChange={handleChange}
                          inputMode="numeric"
                          maxLength={4}
                          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter stock (max 4 digits)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select name="category" value={newProduct.category} onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Select Category</option>
                          <option value="Household Items">Household Items</option>
                          <option value="Fashion & Accessories">Fashion & Accessories</option>
                          <option value="Furniture & Home Decor">Furniture & Home Decor</option>
                          <option value="Construction Materials">Construction Materials</option>
                          <option value="Stationery & Office Supplies">Stationery & Office Supplies</option>
                          <option value="Outdoor & Travel">Outdoor & Travel</option>
                          <option value="Toys & Kids Items">Toys & Kids Items</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Product Image</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border rounded-lg p-2" />
                        {newProduct.imageUrl && (<img src={newProduct.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />)}
                      </div>
                      
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Description</label>
                      <textarea name="description" value={newProduct.description} onChange={handleChange} className="w-full border rounded-lg p-2" placeholder="Enter product description"></textarea>
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">{editingProduct ? "Update Product" : "Create Product"}</button>
                      <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); setNewProduct({ name: "", price: "", stock: "", imageUrl: "", description: "", category: "" }); }} className="border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Stacked layout: Products table then Loyalty Settings */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Products</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (!/^[A-Za-z\s]*$/.test(v)) return; // letters and spaces only
                          setSearchTerm(v);
                        }}
                        onKeyDown={(e) => {
                          const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                          const isLetter = /^[A-Za-z]$/.test(e.key);
                          const isSpace = e.key === ' ';
                          if (!isLetter && !isSpace && !allowedControl.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                          const cleaned = text.replace(/[^A-Za-z\s]/g, '');
                          const next = (searchTerm || '') + cleaned;
                          if (/^[A-Za-z\s]*$/.test(next)) {
                            setSearchTerm(next);
                          }
                        }}
                        pattern="[A-Za-z\s]*"
                        title="Only letters and spaces are allowed"
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-200"
                    >
                      <PackagePlus size={16} className="mr-2 inline" />
                      {showAddForm ? 'Close Form' : 'Add Product'}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    {filteredProducts.length > 0 ? (
                      <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Unit Price (LKR)</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Reward Points</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${p.stock < 50 && highlightLowStock ? 'ring-2 ring-red-200 bg-red-50/40' : ''}`}
                          >
                            <td className="py-3 px-4">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-lg border" />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package size={24} className="text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-gray-900">{p.name}</div>
                              <div className="text-sm text-gray-500">Product ID: {p.productId || (p._id ? `RIP-${(p._id + '').replace(/\D/g,'').slice(-4).padStart(4,'0')}` : `RIP-${String(idx).padStart(4,'0')}`)}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{p.category || 'Uncategorized'}</span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-sm text-gray-600 truncate" title={p.description}>{p.description || 'No description available'}</p>
                            </td>
                            <td className="py-3 px-4 text-center"><span className="font-bold text-green-600">{parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
                            <td className="py-3 px-4 text-center"><span className="font-medium text-gray-900">{p.points ?? 0}</span></td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-gray-900">{p.stock}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.stock < 50 ? 'bg-red-100 text-red-800' : p.stock < 200 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{p.stock < 50 ? 'Low' : p.stock < 200 ? 'Medium' : 'High'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{p.stock < 10 ? 'Out of Stock' : 'Available'}</span></td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleEditProduct(p)}>Edit</button>
                                <button className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-600 p-4">No products found.</div>
                    )}
                  </div>
                </div>
                {/* Loyalty Settings (moved below products table) */}
                <div className="bg-white shadow rounded-2xl p-4">
                  <h3 className="font-bold text-lg mb-3">Loyalty Settings</h3>
                  <form onSubmit={handleSavePointsPerRupee} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium">How many points does 1 rupee represent?</label>
                      <input
                        type="text"
                        value={pointsPerRupee}
                        onChange={(e) => {
                          // Allow only digits, strip leading zeros, limit to 3 digits
                          const raw = e.target.value;
                          let cleaned = raw.replace(/[^0-9]/g, '');
                          cleaned = cleaned.replace(/^0+/, '');
                          cleaned = cleaned.slice(0, 3);
                          if (/^\d{0,3}$/.test(cleaned)) {
                            setPointsPerRupee(cleaned);
                          }
                        }}
                        onKeyDown={(e) => {
                          const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                          const isDigit = /\d/.test(e.key);
                          if (allowedControl.includes(e.key)) return;
                          if (isDigit) return;
                          // Block letters, special chars, dot, minus, plus, 'e'
                          e.preventDefault();
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = (e.clipboardData || window.clipboardData).getData('text') || '';
                          let cleaned = text.replace(/[^0-9]/g, '');
                          cleaned = cleaned.replace(/^0+/, '');
                          cleaned = cleaned.slice(0,3);
                          if (/^\d{0,3}$/.test(cleaned)) {
                            setPointsPerRupee(cleaned);
                          }
                        }}
                        placeholder="e.g., 100"
                        inputMode="numeric"
                        pattern="^\d{1,3}$"
                        title="Enter up to 3 digits (integers only)"
                        className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Save</button>
                    <div className="text-sm mt-2">
                      <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Current: {pointsPerRupee || 'Not set'} points per 1 rupee
                      </span>
                      {pointsSavedAt && (
                        <span className="ml-2 text-gray-500">Last saved: {new Date(pointsSavedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* Production Planning Tab */}
          {activeTab === "planning" && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Production Schedule</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPlan(null); setShowPlanForm((v) => !v); }} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md">{showPlanForm ? 'Close Form' : 'Add Plan'}</button>
                    <button onClick={() => { fetchProductionPlans(); fetchMachines(); }} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md">Refresh</button>
                  </div>
                </div>
                {showPlanForm && (
                  <form onSubmit={submitPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium">Product (optional)</label>
                      <select value={planForm.productId} onChange={handlePlanProductSelect} className="w-full border rounded-lg p-2">
                        <option value="">-- Select product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Product Name</label>
                      <input name="productName" value={planForm.productName} onChange={handlePlanFormChange} className="w-full border rounded-lg p-2" placeholder="e.g., Recycled PET Bottles" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Quantity</label>
                      <input
                        name="quantity"
                        value={planForm.quantity}
                        onChange={handlePlanFormChange}
                        onKeyDown={(e) => {
                          const allowedCtrl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                          if (allowedCtrl.includes(e.key)) return;
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        className="w-full border rounded-lg p-2"
                        placeholder="e.g., 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Priority</label>
                      <select name="priority" value={planForm.priority} onChange={handlePlanFormChange} className="w-full border rounded-lg p-2">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Start Date</label>
                      <input
                        name="startDate"
                        value={planForm.startDate}
                        onChange={handlePlanFormChange}
                        type="date"
                        min={(() => { const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; })()}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">End Date</label>
                      <input
                        name="endDate"
                        value={planForm.endDate}
                        onChange={handlePlanFormChange}
                        type="date"
                        min={planForm.startDate || (() => { const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; })()}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select name="status" value={planForm.status} onChange={handlePlanFormChange} className="w-full border rounded-lg p-2">
                        <option>Scheduled</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Paused</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium">Notes</label>
                      <textarea name="notes" value={planForm.notes} onChange={handlePlanFormChange} className="w-full border rounded-lg p-2" rows="2" />
                    </div>
                    <div className="md:col-span-3 flex gap-3">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">{editingPlan ? 'Update Plan' : 'Create Plan'}</button>
                      {editingPlan && (
                        <button type="button" onClick={() => { setEditingPlan(null); setPlanForm({ productName: '', productId: '', quantity: '', startDate: '', endDate: '', priority: 'Medium', status: 'Scheduled', notes: '' }); setShowPlanForm(false); }} className="border px-4 py-2 rounded-lg">Cancel</button>
                      )}
                    </div>
                  </form>
                )}
                {loadingPlans ? (
                  <div className="py-8 text-center text-gray-500">Loading plans...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Product</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Quantity</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Start Date</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">End Date</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Priority</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-gray-500">No plans found.</td>
                          </tr>
                        ) : (
                          plans.map((item) => (
                            <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{item.productName}</td>
                              <td className="py-3 px-2 text-center">{item.quantity}</td>
                              <td className="py-3 px-2 text-center">{item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}</td>
                              <td className="py-3 px-2 text-center">{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.priority === "High" || item.priority === 'Urgent' ? "bg-red-100 text-red-800" :
                                  item.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-green-100 text-green-800"
                                }`}>
                                  {item.priority}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                  item.status === "Completed" ? "bg-green-100 text-green-800" :
                                  item.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {item.status === 'In Progress' && (
                                    <button onClick={() => completePlan(item)} className="px-3 py-1 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700">Complete</button>
                                  )}
                                  {item.status === 'Completed' && (
                                    <button onClick={() => goToQuality(item)} className="px-3 py-1 rounded-md text-sm bg-purple-600 text-white hover:bg-purple-700">Quality Check</button>
                                  )}
                                  <button onClick={() => editPlan(item)} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                                  <button onClick={() => deletePlan(item._id)} className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white shadow-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Machine Status</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingMachine(null); setShowMachineForm((v) => !v); }} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md">{showMachineForm ? 'Close Form' : 'Add Machine'}</button>
                    <button onClick={() => { fetchMachines(); }} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md">Refresh</button>
                  </div>
                </div>
                {showMachineForm && (
                  <form onSubmit={submitMachine} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        name="name"
                        value={machineForm.name}
                        onChange={handleMachineFormChange}
                        className="w-full border rounded-lg p-2"
                        placeholder="e.g., Extruder #1"
                        required
                        minLength={3}
                        maxLength={50}
                        pattern="[A-Za-z0-9 \-_#()]{3,50}"
                        title="3–50 chars. Allowed: letters, numbers, spaces, - _ # ( )"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Code</label>
                      <input
                        name="code"
                        value={machineForm.code}
                        onChange={handleMachineFormChange}
                        className="w-full border rounded-lg p-2"
                        placeholder="e.g., EX_001"
                        required
                        minLength={3}
                        maxLength={10}
                        pattern="[A-Z0-9\-_]{3,10}"
                        title="3–10 chars. Uppercase letters, numbers, dash, underscore."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select name="status" value={machineForm.status} onChange={handleMachineFormChange} className="w-full border rounded-lg p-2" required>
                        <option>Idle</option>
                        <option>Running</option>
                        <option>Stopped</option>
                        <option>Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Efficiency (%)</label>
                      <input
                        name="efficiency"
                        value={machineForm.efficiency}
                        onChange={handleMachineFormChange}
                        type="number"
                        min="1"
                        max="100"
                        required
                        className="w-full border rounded-lg p-2"
                        placeholder="e.g., 95"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Last Maintenance</label>
                      <input
                        name="lastMaintenance"
                        value={machineForm.lastMaintenance}
                        onChange={handleMachineFormChange}
                        type="date"
                        required
                        max={new Date().toISOString().slice(0,10)}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium">Notes</label>
                      <textarea
                        name="notes"
                        value={machineForm.notes}
                        onChange={handleMachineFormChange}
                        className="w-full border rounded-lg p-2"
                        rows="2"
                        maxLength={200}
                        placeholder="Optional (max 200 characters)"
                      />
                    </div>
                    <div className="md:col-span-3 flex gap-3">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">{editingMachine ? 'Update Machine' : 'Create Machine'}</button>
                      {editingMachine && (
                        <button type="button" onClick={() => { setEditingMachine(null); setMachineForm({ name: '', code: '', status: 'Idle', efficiency: '', lastMaintenance: '', notes: '' }); setShowMachineForm(false); }} className="border px-4 py-2 rounded-lg">Cancel</button>
                      )}
                    </div>
                  </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {machines.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">No machines found.</div>
                  ) : (
                    machines.map((machine) => (
                      <div key={machine._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{machine.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            machine.status === "Running" ? "bg-green-100 text-green-800" :
                            machine.status === "Maintenance" ? "bg-yellow-100 text-yellow-800" :
                            machine.status === "Offline" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {machine.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Efficiency:</span>
                            <span className="text-sm font-medium">{machine.efficiency}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Maintenance:</span>
                            <span className="text-sm">{machine.lastMaintenance ? new Date(machine.lastMaintenance).toLocaleDateString() : '-'}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button onClick={() => editMachine(machine)} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                          <button onClick={() => deleteMachine(machine._id)} className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Raw Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Raw Materials Inventory</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      fetchInventoryData();
                      fetchAcceptedMaterials();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Package size={18} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Inventory Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...inventoryItems]
                      .sort((a, b) => (a.itemCode || "").localeCompare(b.itemCode || "", undefined, { numeric: true, sensitivity: 'base' }))
                      .map((item) => (
                      <div key={item._id} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.stock < 10 ? 'bg-red-100 text-red-800' :
                            item.stock < 500 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.stock < 10 ? 'Low Stock' :
                             item.stock < 500 ? 'Medium Stock' : 'High Stock'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Color:</span>
                            <span className="font-medium">{item.color}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stock (kg):</span>
                            <span className="font-bold text-lg">{item.stock} kg</span>
                          </div>
                        </div>

                        <button
                          onClick={() => openRequestModal(item)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                          <ShoppingCart size={16} />
                          <span>Request Material</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {inventoryItems.length === 0 && (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No inventory items found</p>
                    </div>
                  )}

                  {/* Production Requests Table */}
                  <div className="bg-white shadow-lg rounded-2xl p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Production Requests</h3>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={requestQuery}
                          onChange={(e) => setRequestQuery(e.target.value)}
                          placeholder="Search (ID, team, item, status)"
                          className="border rounded-lg px-3 py-2 text-sm"
                        />
                        <select
                          value={requestPageSize}
                          onChange={(e) => setRequestPageSize(parseInt(e.target.value) || 10)}
                          className="border rounded-lg px-2 py-2 text-sm"
                        >
                          <option value={10}>10 / page</option>
                          <option value={25}>25 / page</option>
                          <option value={50}>50 / page</option>
                        </select>
                      </div>
                    </div>
                    {filteredRequests.length === 0 ? (
                      <div className="text-gray-600">No production requests found.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50 text-left text-sm text-gray-700">
                              <th className="py-3 px-4 font-semibold">Request ID</th>
                              <th className="py-3 px-4 font-semibold">Team</th>
                              <th className="py-3 px-4 font-semibold">Item</th>
                              <th className="py-3 px-4 font-semibold">Quantity</th>
                              <th className="py-3 px-4 font-semibold">Priority</th>
                              <th className="py-3 px-4 font-semibold">Status</th>
                              <th className="py-3 px-4 font-semibold">Request Time</th>
                              <th className="py-3 px-4 font-semibold">Approved/Reject Timedate</th>
                              <th className="py-3 px-4 font-semibold">Approved By</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedRequests.map((req) => (
                              <tr key={req._id} className="border-t text-sm">
                                <td className="py-3 px-4 text-gray-900">{req.requestId || (req._id?.slice(-8)) || '-'}</td>
                                <td className="py-3 px-4">{req.team}</td>
                                <td className="py-3 px-4">{req.inventoryItemId?.name || 'Unknown Item'}</td>
                                <td className="py-3 px-4">{req.requestedQty}</td>
                                <td className="py-3 px-4">{req.priority}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                    req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4">{(req.createdAt || req.createdDate) ? new Date(req.createdAt || req.createdDate).toLocaleString() : '-'}</td>
                                <td className="py-3 px-4">{
                                  req.status === 'Pending'
                                    ? '-'
                                    : ((req.approvedAt || req.approvedDate)
                                        ? new Date(req.approvedAt || req.approvedDate).toLocaleString()
                                        : '-')
                                }</td>
                                <td className="py-3 px-4">{req.approvedBy || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
                          <div>
                            Showing {filteredRequests.length === 0 ? 0 : (currentRequestPage - 1) * requestPageSize + 1}
                            -{Math.min(currentRequestPage * requestPageSize, filteredRequests.length)} of {filteredRequests.length}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                              disabled={currentRequestPage === 1}
                              className={`px-3 py-1 rounded border ${currentRequestPage === 1 ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-50'}`}
                            >
                              Prev
                            </button>
                            <span className="px-2">Page {currentRequestPage} / {totalRequestPages}</span>
                            <button
                              onClick={() => setRequestPage((p) => Math.min(totalRequestPages, p + 1))}
                              disabled={currentRequestPage === totalRequestPages}
                              className={`px-3 py-1 rounded border ${currentRequestPage === totalRequestPages ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-50'}`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Production Request Modal */}
          {showRequestModal && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold mb-4">Request Material: {selectedItem.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team/Department</label>
                    <input
                      type="text"
                      name="team"
                      value={requestForm.team}
                      onChange={handleRequestFormChange}
                      pattern="^[A-Za-z\s]*$"
                      title="Only letters and spaces are allowed"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Production Team A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested Quantity (Available: {selectedItem.stock})
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      name="requestedQty"
                      value={requestForm.requestedQty}
                      onChange={handleRequestFormChange}
                      onKeyDown={(e) => {
                        const ctrl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                        if (ctrl.includes(e.key)) return;
                        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                      }}
                      title={`Enter digits only (max ${selectedItem.stock})`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={requestForm.priority}
                      onChange={handleRequestFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={requestForm.notes}
                      onChange={handleRequestFormChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes or requirements..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={createProductionRequest}
                    disabled={!requestForm.team || !requestForm.requestedQty}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedItem(null);
                      setRequestForm({ team: '', requestedQty: '', notes: '', priority: 'Medium' });
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quality Control Tab */}
          {activeTab === "quality" && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Quality Records</h3>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingQuality(null); setShowQualityForm((v) => !v); }} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-md">{showQualityForm ? 'Close Form' : 'Add Record'}</button>
                    <button onClick={() => { fetchQualityRecords(); }} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md">Refresh</button>
                  </div>
                </div>
                {showQualityForm && (
                  <form onSubmit={submitQuality} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium">Batch No</label>
                      <input name="batchNo" value={qualityForm.batchNo} onChange={handleQualityChange} className="w-full border rounded-lg p-2" placeholder="e.g., RIP-0001" pattern="^RIP-\d{4}$" title="Format: RIP-0001" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Product (optional)</label>
                      <select value={qualityForm.productId} onChange={handleQualityProductSelect} className="w-full border rounded-lg p-2">
                        <option value="">-- Select product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Product Name</label>
                      <input name="productName" value={qualityForm.productName} onChange={handleQualityChange} className="w-full border rounded-lg p-2" placeholder="e.g., Recycled PET Bottles" pattern="^[A-Za-z\s]*$" title="Only letters and spaces are allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select name="status" value={qualityForm.status} onChange={handleQualityChange} className="w-full border rounded-lg p-2">
                        <option>Passed</option>
                        <option>Failed</option>
                        <option>Rework</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Inspected Quantity</label>
                      <input name="inspectedQuantity" value={qualityForm.inspectedQuantity} onChange={handleQualityChange} type="text" inputMode="numeric" pattern="\d{1,4}" maxLength={4} className="w-full border rounded-lg p-2" placeholder="e.g., 500" title="Enter up to 4 digits" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Defects (comma separated)</label>
                      <input name="defects" value={qualityForm.defects} onChange={handleQualityChange} className="w-full border rounded-lg p-2" placeholder="e.g., scratch, color mismatch" pattern="^[A-Za-z\s,]*$" title="Only letters, commas, and spaces are allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Defect Count</label>
                      <input name="defectCount" value={qualityForm.defectCount} onChange={handleQualityChange} type="text" inputMode="numeric" pattern="\d{0,3}" maxLength={3} className="w-full border rounded-lg p-2" title="Up to 3 digits" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Inspection Date</label>
                      <input name="inspectionDate" value={qualityForm.inspectionDate} onChange={handleQualityChange} type="date" className="w-full border rounded-lg p-2" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1">Checks</label>
                      <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="visual" checked={!!qualityForm.checks?.visual} onChange={handleQualityCheckToggle} /> Visual</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="dimensions" checked={!!qualityForm.checks?.dimensions} onChange={handleQualityCheckToggle} /> Dimensions</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="functional" checked={!!qualityForm.checks?.functional} onChange={handleQualityCheckToggle} /> Functional</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="packaging" checked={!!qualityForm.checks?.packaging} onChange={handleQualityCheckToggle} /> Packaging</label>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="safety" checked={!!qualityForm.checks?.safety} onChange={handleQualityCheckToggle} /> Safety</label>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="mr-2 text-gray-600">Suggested:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${((qualityForm.checks && (qualityForm.checks.visual===false || qualityForm.checks.dimensions===false || qualityForm.checks.functional===false || qualityForm.checks.packaging===false || qualityForm.checks.safety===false)) || (parseInt(qualityForm.defectCount||'0')>0)) ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {((qualityForm.checks && (qualityForm.checks.visual===false || qualityForm.checks.dimensions===false || qualityForm.checks.functional===false || qualityForm.checks.packaging===false || qualityForm.checks.safety===false)) || (parseInt(qualityForm.defectCount||'0')>0)) ? 'Rework' : 'Passed'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Inspector</label>
                      <input name="inspector" value={qualityForm.inspector} onChange={handleQualityChange} className="w-full border rounded-lg p-2" placeholder="e.g., John Doe" pattern="^[A-Za-z\s]*$" title="Only letters and spaces are allowed" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium">Notes</label>
                      <textarea name="notes" value={qualityForm.notes} onChange={handleQualityChange} className="w-full border rounded-lg p-2" rows="2" />
                    </div>
                    <div className="md:col-span-3 flex gap-3">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">{editingQuality ? 'Update Record' : 'Create Record'}</button>
                      {editingQuality && (
                        <button type="button" onClick={() => { setEditingQuality(null); setShowQualityForm(false); setQualityForm({ batchNo: '', productId: '', productName: '', status: 'Passed', defects: '', defectCount: '', inspectionDate: '', inspector: '', notes: '' }); }} className="border px-4 py-2 rounded-lg">Cancel</button>
                      )}
                    </div>
                  </form>
                )}
                {loadingQuality ? (
                  <div className="py-8 text-center text-gray-500">Loading quality records...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Batch No</th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Product</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Status</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Defects</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Inspected On</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Inspector</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qualityRecords.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-gray-500">No records found.</td>
                          </tr>
                        ) : (
                          qualityRecords.map((r) => (
                            <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{r.batchNo}</td>
                              <td className="py-3 px-2">{r.productName}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  r.status === 'Passed' ? 'bg-green-100 text-green-800' :
                                  r.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">{Array.isArray(r.defects) ? r.defects.join(', ') : r.defects}</td>
                              <td className="py-3 px-2 text-center">{r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString() : '-'}</td>
                              <td className="py-3 px-2 text-center">{r.inspector}</td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => editQuality(r)} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                                  <button onClick={() => deleteQuality(r._id)} className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics moved to separate page at /production/analytics */}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Factory size={48} className="mx-auto text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Production Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Monthly production summary</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Settings size={48} className="mx-auto text-green-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Quality Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Quality control analysis</p>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
                <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <Package size={48} className="mx-auto text-purple-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Inventory Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Stock and materials analysis</p>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg">Generate Report</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
