const { Collection, Vehicle, Driver, TransportRoute, TransportAnalytics } = require('../Model/TransportModel');

// Collection Management
const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate('assignedVehicle', 'vehicleId type')
      .populate('assignedDriver', 'personalInfo.firstName personalInfo.lastName')
      .populate('route', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('assignedVehicle')
      .populate('assignedDriver')
      .populate('route');
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCollection = async (req, res) => {
  try {
    const { location, bottleCount, scheduledTime, assignedVehicle, assignedDriver, route, priority, notes } = req.body;
    
    // Generate collection ID
    const collectionCount = await Collection.countDocuments();
    const collectionId = `COL${String(collectionCount + 1).padStart(3, '0')}`;

    const newCollection = new Collection({
      collectionId,
      location,
      bottleCount: {
        scheduled: bottleCount.scheduled,
        collected: 0,
        remaining: bottleCount.scheduled
      },
      scheduledTime,
      assignedVehicle,
      assignedDriver,
      route,
      priority: priority || 'Medium',
      notes
    });

    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCollectionStatus = async (req, res) => {
  try {
    const { status, progress, collectedBottles, actualStartTime, actualCompletionTime, notes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (collectedBottles !== undefined) {
      updateData['bottleCount.collected'] = collectedBottles;
    }
    if (actualStartTime) updateData['scheduledTime.actualStartTime'] = actualStartTime;
    if (actualCompletionTime) updateData['scheduledTime.actualCompletionTime'] = actualCompletionTime;
    if (notes) updateData.notes = notes;

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vehicle Management
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('assignedDriver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ vehicleId: 1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVehicleLocation = async (req, res) => {
  try {
    const { location, coordinates } = req.body;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        'currentLocation.name': location,
        'currentLocation.coordinates': coordinates,
        'currentLocation.lastUpdated': new Date()
      },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Driver Management
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('assignedVehicle', 'vehicleId type')
      .sort({ 'personalInfo.firstName': 1 });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDriver = async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const { currentStatus } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { currentStatus },
      { new: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.status(200).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route Management
const getAllRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find()
      .populate('assignedVehicles', 'vehicleId type')
      .sort({ routeId: 1 });
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoute = async (req, res) => {
  try {
    const { name, description, locations, distance, estimatedDuration, frequency, schedule } = req.body;
    
    // Generate route ID
    const routeCount = await TransportRoute.countDocuments();
    const routeId = `RT${String(routeCount + 1).padStart(3, '0')}`;

    const newRoute = new TransportRoute({
      routeId,
      name,
      description,
      locations,
      distance,
      estimatedDuration,
      frequency,
      schedule
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.status(200).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Analytics
const getTransportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Collection analytics
    const collectionStats = await Collection.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalScheduled: { $sum: '$bottleCount.scheduled' },
          totalCollected: { $sum: '$bottleCount.collected' },
          completedCollections: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          delayedCollections: {
            $sum: { $cond: [{ $eq: ['$status', 'Delayed'] }, 1, 0] }
          },
          totalCollections: { $sum: 1 },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Vehicle status
    const vehicleStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly collection trends
    const monthlyTrends = await Collection.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          scheduled: { $sum: '$bottleCount.scheduled' },
          collected: { $sum: '$bottleCount.collected' },
          collections: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Route performance
    const routePerformance = await Collection.aggregate([
      { $match: { ...matchCondition, route: { $exists: true } } },
      {
        $lookup: {
          from: 'transportroutes',
          localField: 'route',
          foreignField: '_id',
          as: 'routeInfo'
        }
      },
      { $unwind: '$routeInfo' },
      {
        $group: {
          _id: '$route',
          routeName: { $first: '$routeInfo.name' },
          totalCollections: { $sum: 1 },
          completedCollections: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          totalBottles: { $sum: '$bottleCount.collected' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    res.status(200).json({
      summary: collectionStats[0] || {
        totalScheduled: 0,
        totalCollected: 0,
        completedCollections: 0,
        delayedCollections: 0,
        totalCollections: 0,
        averageProgress: 0
      },
      vehicleStats,
      monthlyTrends,
      routePerformance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's collections
    const todayCollections = await Collection.countDocuments({
      'scheduledTime.startTime': {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Today's bottles collected
    const todayBottles = await Collection.aggregate([
      {
        $match: {
          'scheduledTime.startTime': {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$bottleCount.collected' }
        }
      }
    ]);

    // Active vehicles
    const activeVehicles = await Vehicle.countDocuments({ status: 'Active' });
    const totalVehicles = await Vehicle.countDocuments();

    // Route efficiency
    const routeEfficiency = await Collection.aggregate([
      {
        $match: {
          status: { $in: ['Completed', 'In Progress'] }
        }
      },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    res.status(200).json({
      todayCollections,
      todayBottles: todayBottles[0]?.totalCollected || 0,
      activeVehicles,
      totalVehicles,
      routeEfficiency: routeEfficiency[0]?.averageProgress || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete collection
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollectionStatus,
  getAllVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleLocation,
  getAllDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  getAllRoutes,
  createRoute,
  updateRoute,
  getTransportAnalytics,
  getDashboardSummary,
  deleteCollection
};
