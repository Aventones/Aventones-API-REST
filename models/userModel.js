const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    statusUser: { type: String, default: 'not verified' }, // Default value set to 'not verified'
    firstName: String,
    lastName: String,
    cedula: String,
    dob: Date,
    email: String,
    phone: { type: Number, default: 86145781 }, // Default value set to 86145781
    password: String,
    profilePicture: String,
    isDriver: Boolean,
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;