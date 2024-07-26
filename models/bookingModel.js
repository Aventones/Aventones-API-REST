const mongoose = require('mongoose');
const schema = mongoose.Schema;

const booking = new schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'drivers' },
    riders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'riders' }],
    pickup: { type: String },
    destination: { type: String },
    days: { type: Array },
    fee: { type: Number },
    time: { type: String },
    seatsAvailable: { type: Number }
});

module.exports = mongoose.model('bookings', booking);