const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    model: { type: String },
    year: { type: Number },
    plate: { type: String },
    make: { type: String },
    seats: { type: Number }
});

const VehicleModel = mongoose.model('Vehicle', VehicleSchema);

module.exports = VehicleModel;