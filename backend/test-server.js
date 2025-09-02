const express = require("express");
const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Start server
app.listen(5000, () => {
    console.log('Test server running on port 5000');
});
