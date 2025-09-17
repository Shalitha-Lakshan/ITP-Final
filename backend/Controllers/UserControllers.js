const User = require("../Model/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "ecocycle_jwt_secret_key_2024";

// Get all users with professional response
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, status, search } = req.query;
        
        // Build query object
        let query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { nic: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get users with pagination
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({ 
            success: true,
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (err) {
        console.error("Get users error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Error fetching users" 
        });
    }
};

// Professional user registration
const addUser = async (req, res, next) => {
    try {
        const { nic, name, email, password, mobile, address, role } = req.body;

        // Comprehensive validation
        if (!nic || !name || !email || !password || !mobile || !address) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required",
                errors: {
                    nic: !nic ? "NIC is required" : null,
                    name: !name ? "Name is required" : null,
                    email: !email ? "Email is required" : null,
                    password: !password ? "Password is required" : null,
                    mobile: !mobile ? "Mobile number is required" : null,
                    address: !address ? "Address is required" : null
                }
            });
        }

        // Check if user already exists
        const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingUserByEmail) {
            return res.status(409).json({ 
                success: false,
                message: "User already exists with this email",
                field: "email"
            });
        }

        const existingUserByNIC = await User.findOne({ nic });
        if (existingUserByNIC) {
            return res.status(409).json({ 
                success: false,
                message: "User already exists with this NIC",
                field: "nic"
            });
        }

        // Create new user
        const newUser = new User({
            nic: nic.trim(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            mobile: mobile.trim(),
            address: address.trim(),
            role: role || "user"
        });

        // Save user (password will be automatically hashed by pre-save middleware)
        const savedUser = await newUser.save();

        return res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            user: savedUser,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Registration error:", err);
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = {};
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
            
            return res.status(400).json({ 
                success: false,
                message: "Validation failed",
                errors
            });
        }

        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({ 
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                field
            });
        }

        return res.status(500).json({ 
            success: false,
            message: "Internal server error during registration"
        });
    }
};

// Get user by ID with professional response
const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Validate ObjectId format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid user ID format" 
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            user
        });

    } catch (err) {
        console.error("Get user error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Error fetching user" 
        });
    }
};

// Professional user update
const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { nic, name, email, mobile, address, role, status } = req.body;

        // Validate required fields
        if (!nic || !name || !email || !mobile || !address) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required except password"
            });
        }

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Update user data
        const updateData = {
            nic: nic.trim(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            address: address.trim(),
            updatedAt: new Date()
        };

        // Only update role and status if provided
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        );

        return res.status(200).json({ 
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error("Update error:", err);
        
        if (err.name === 'ValidationError') {
            const errors = {};
            Object.keys(err.errors).forEach(key => {
                errors[key] = err.errors[key].message;
            });
            
            return res.status(400).json({ 
                success: false,
                message: "Validation failed",
                errors
            });
        }

        return res.status(500).json({ 
            success: false,
            message: "Error updating user"
        });
    }
};

// Professional user deletion
const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Validate ObjectId format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid user ID format" 
            });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "User deleted successfully",
            deletedUser: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Delete user error:", err);
        return res.status(500).json({ 
            success: false,
            message: "Error deleting user" 
        });
    }
};



// Professional user login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: "Account is inactive. Please contact support."
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update last login
        user.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                nic: user.nic,
                mobile: user.mobile,
                address: user.address
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;