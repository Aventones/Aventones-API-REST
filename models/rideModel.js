const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    riders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pickup : String,
    destination: String,
    days: Array,
    fee: Number,
    time: String,
    seatsAvailable: Number
});

const RideModel = mongoose.model('Ride', RideSchema);

module.exports = RideModel;