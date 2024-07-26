const mongoose = require('mongoose');
const schema = mongoose.Schema;

const rider = new schema({
    first_name: { type: String },
    last_name: { type: String },
    cedula: { type: String },
    dob: { type: Date },
    email: { type: String },
    phone: { type: Number },
    password: { type: String },
    profilePicture: { type: String }
});

module.exports = mongoose.model('riders', rider);