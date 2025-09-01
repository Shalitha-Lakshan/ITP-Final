// pass = ZL7IayqbTspqb2rd
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./Routes/UserRoutes");
const salesRoutes = require("./Routes/SalesRoutes");
const paymentRoutes = require("./Routes/PaymentRoutes");
const transportRoutes = require("./Routes/TransportRoutes");
const userDashboardRoutes = require("./Routes/UserDashboardRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json()); 
app.use("/users", router);
app.use("/api/sales", salesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/user", userDashboardRoutes); 



// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:ZL7IayqbTspqb2rd@cluster0.hk1j2kb.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    // Start the server
    app.listen(5000);
})
.catch(err => console.error("Failed to connect to MongoDB", err));



