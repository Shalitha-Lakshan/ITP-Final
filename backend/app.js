// pass = ZL7IayqbTspqb2rd
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/UserRoutes");

const app = express();


// Middleware
app.use(express.json()); 
app.use("/users", router); 



// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:ZL7IayqbTspqb2rd@cluster0.hk1j2kb.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    // Start the server
    app.listen(5000);
})
.catch(err => console.error("Failed to connect to MongoDB", err));



