const mongoose = require('mongoose');

// Collection Schema
const collectionSchema = new mongoose.Schema({
  collectionId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  bottleCount: {
    scheduled: {
      type: Number,
      required: true,
      min: 0
    },
    collected: {
      type: Number,
      default: 0,
      min: 0
    },
    remaining: {
      type: Number,
      default: function() {
        return this.scheduled - this.collected;
      }
    }
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Delayed', 'Cancelled'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportRoute'
  },
  scheduledTime: {
    startTime: {
      type: Date,
      required: true
    },
    estimatedCompletion: {
      type: Date,
      required: true
    },
    actualStartTime: Date,
    actualCompletionTime: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: String,
  images: [{
    url: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Small Truck', 'Medium Truck', 'Large Truck', 'Van'],
    required: true
  },
  capacity: {
    bottles: {
      type: Number,
      required: true,
      min: 0
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    }
  },
  specifications: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    color: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Out of Service'],
    default: 'Active'
  },
  currentLocation: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  fuel: {
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    lastRefuel: Date,
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Diesel'
    }
  },
  maintenance: {
    status: {
      type: String,
      enum: ['Good', 'Service Due', 'Needs Repair', 'In Service'],
      default: 'Good'
    },
    lastService: Date,
    nextService: Date,
    mileage: {
      type: Number,
      default: 0
    }
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }
}, {
  timestamps: true
});

// Driver Schema
const driverSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    dateOfBirth: Date
  },
  license: {
    number: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Class A', 'Class B', 'Class C', 'CDL'],
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  employment: {
    hireDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
      default: 'Active'
    },
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night', 'Flexible'],
      default: 'Morning'
    }
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  currentStatus: {
    type: String,
    enum: ['Available', 'On Route', 'On Break', 'Off Duty'],
    default: 'Available'
  },
  performance: {
    totalCollections: {
      type: Number,
      default: 0
    },
    totalBottlesCollected: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    punctualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  }
}, {
  timestamps: true
});

// Transport Route Schema
const transportRouteSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  locations: [{
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    estimatedBottles: Number,
    estimatedTime: Number, // in minutes
    order: Number
  }],
  distance: {
    total: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  estimatedDuration: {
    type: Number,
    required: true // in minutes
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Twice Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'On Demand'],
    required: true
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Review'],
    default: 'Active'
  },
  assignedVehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  performance: {
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageTime: Number,
    totalCollections: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Transport Analytics Schema
const transportAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  collections: {
    scheduled: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    delayed: {
      type: Number,
      default: 0
    },
    cancelled: {
      type: Number,
      default: 0
    }
  },
  bottles: {
    scheduled: {
      type: Number,
      default: 0
    },
    collected: {
      type: Number,
      default: 0
    }
  },
  vehicles: {
    active: {
      type: Number,
      default: 0
    },
    maintenance: {
      type: Number,
      default: 0
    },
    outOfService: {
      type: Number,
      default: 0
    }
  },
  efficiency: {
    collectionRate: {
      type: Number,
      default: 0
    },
    onTimeRate: {
      type: Number,
      default: 0
    },
    fuelEfficiency: {
      type: Number,
      default: 0
    }
  },
  costs: {
    fuel: {
      type: Number,
      default: 0
    },
    maintenance: {
      type: Number,
      default: 0
    },
    labor: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

const Collection = mongoose.model('Collection', collectionSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Driver = mongoose.model('Driver', driverSchema);
const TransportRoute = mongoose.model('TransportRoute', transportRouteSchema);
const TransportAnalytics = mongoose.model('TransportAnalytics', transportAnalyticsSchema);

module.exports = {
  Collection,
  Vehicle,
  Driver,
  TransportRoute,
  TransportAnalytics
};
