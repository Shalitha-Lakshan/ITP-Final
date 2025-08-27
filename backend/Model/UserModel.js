const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({

    nic: {
        type: String,
        required: true,
        unique: true
    },
   
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    rewardPoints: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("User", userSchema);




