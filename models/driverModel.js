const mongoose = require('mongoose');
const schema = mongoose.Schema;

const driver = new schema({
    first_name: { type: String },
    last_name: { type: String },
    cedula: { type: String },
    dob: { type: Date },
    email: { type: String },
    phone: { type: Number },
    password: { type: String },
    profilePicture: { type: String },
    model: { type: String },
    year: { type: Number },
    plate: { type: String },
    make: { type: String },
    seats: { type: Number }
});

module.exports = mongoose.model('drivers', driver);