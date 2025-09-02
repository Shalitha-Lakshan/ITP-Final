// pass = ZL7IayqbTspqb2rd
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Import routes
const userRoutes = require("./Routes/UserRoutes");

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use("/api/users", userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'EcoCycle API is running',
        timestamp: new Date().toISOString()
    });
});

// Registration form endpoint
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Welcome to EcoCycle API',
        endpoints: {
            users: '/api/users',
            register: '/register',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Endpoint not found'
    });
}); 



// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:ZL7IayqbTspqb2rd@cluster0.hk1j2kb.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    // Start the server
    app.listen(5000);
})
.catch(err => console.error("Failed to connect to MongoDB", err));

//test comment
