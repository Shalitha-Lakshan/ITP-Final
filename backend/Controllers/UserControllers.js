const User = require("../Model/UserModel");

//display all users
const getAllUsers = async (req, res, next) => {

    let users;

    try {
        users = await User.find();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching users" });
    }

    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
    }

    //display all users
    return res.status(200).json({ users });

};

//data insert
const addUser = async (req, res, next) => {
    const { nic, name, email, password, mobile, address } = req.body;

    if (!nic || !name || !email || !password || !mobile || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({
        nic,
        name,
        email,
        password,
        mobile,
        address
    });

    try {
        await newUser.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving user" });
    }

    return res.status(201).json({ user: newUser });
};

//get by id
const getUserById = async (req, res, next) => {
    const userId = req.params.id;

    let user;

    try {
        user = await User.findById(userId);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching user" });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
};

// update user details
const updateUser = async (req, res, next) => {
    const userId = req.params.id;
    const { nic, name, email, password, mobile, address } = req.body;

    if (!nic || !name || !email || !password || !mobile || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let user;

    try {
        user = await User.findByIdAndUpdate(userId, {
            nic,
            name,
            email,
            password,
            mobile,
            address
        }, { new: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating user" });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
};

// delete user 
const deleteUser = async (req, res, next) => {
    const userId = req.params.id;

    let user;

    try {
        user = await User.findByIdAndDelete(userId);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error deleting user" });
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
};



exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;