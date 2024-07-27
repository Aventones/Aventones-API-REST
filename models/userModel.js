const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    cedula: String,
    dob: Date,
    email: String,
    phone: Number,
    password: String,
    profilePicture: String,
    isDriver: Boolean,
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;