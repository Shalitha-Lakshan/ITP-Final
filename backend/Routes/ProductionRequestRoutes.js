const express = require('express');
const router = express.Router();
const productionRequestController = require('../Controllers/ProductionRequestController');

// Create a new production request
router.post('/', productionRequestController.createRequest);

// Get all production requests
router.get('/', productionRequestController.getAllRequests);

// Get production requests by status
router.get('/status/:status', productionRequestController.getRequestsByStatus);

// Get a single production request by ID
router.get('/:id', productionRequestController.getRequestById);

// Update production request status
router.put('/:id/status', productionRequestController.updateRequestStatus);

// Delete a production request
router.delete('/:id', productionRequestController.deleteRequest);

module.exports = router;
