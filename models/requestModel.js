const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rideDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ride : { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
});

const RequestModel = mongoose.model('Request', RequestSchema);

module.exports = RequestModel;