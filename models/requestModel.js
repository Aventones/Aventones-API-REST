const mongoose = require('mongoose');
const schema = mongoose.Schema;

const request = new schema({
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'riders' },
    bookingDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'drivers' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'bookings' },
});

module.exports = mongoose.model('requests', request);