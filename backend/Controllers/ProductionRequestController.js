const ProductionRequest = require('../Model/ProductionRequestModel');
const Inventory = require('../Model/InventoryModel');

// Create a new production request
exports.createRequest = async (req, res) => {
  try {
    const { team, inventoryItemId, requestedQty, notes, priority } = req.body;

    // Validate required fields
    if (!team || !inventoryItemId || !requestedQty) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if inventory item exists
    const inventoryItem = await Inventory.findById(inventoryItemId);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if requested quantity is available
    if (inventoryItem.stock < requestedQty) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Create new production request
    const newRequest = new ProductionRequest({
      team,
      inventoryItemId,
      requestedQty,
      notes: notes || '',
      priority: priority || 'Medium'
    });

    const savedRequest = await newRequest.save();
    const populatedRequest = await ProductionRequest.findById(savedRequest._id).populate('inventoryItemId');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating production request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all production requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ProductionRequest.find()
      .populate('inventoryItemId')
      .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching production requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get production requests by status
exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const requests = await ProductionRequest.find({ status })
      .populate('inventoryItemId')
      .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests by status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update production request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, notes } = req.body;

    const request = await ProductionRequest.findById(id).populate('inventoryItemId');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // If approving the request, check stock and deduct from inventory
    if (status === 'Approved' && request.status === 'Pending') {
      const inventoryItem = await Inventory.findById(request.inventoryItemId._id);
      
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      if (inventoryItem.stock < request.requestedQty) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }

      // Deduct stock from inventory
      inventoryItem.stock -= request.requestedQty;
      inventoryItem.lastUpdated = new Date().toISOString();
      await inventoryItem.save();

      request.approvedDate = new Date();
      if (approvedBy) request.approvedBy = approvedBy;
    }

    // Update request status
    request.status = status;
    if (notes) request.notes = notes;

    const updatedRequest = await request.save();
    const populatedRequest = await ProductionRequest.findById(updatedRequest._id).populate('inventoryItemId');
    
    res.json(populatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a production request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await ProductionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow deletion of pending or rejected requests
    if (request.status === 'Approved' || request.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot delete approved or completed requests' });
    }

    await ProductionRequest.findByIdAndDelete(id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting production request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single production request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ProductionRequest.findById(id).populate('inventoryItemId');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error fetching production request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
