const jwt = require('jsonwebtoken');
const Rider = require('../models/riderModel');
const Driver = require('../models/driverModel');

const userGet = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'rider') {
        user = await Rider.findById(decoded.userId).select('-password');
    } else if (decoded.role === 'driver') {
        user = await Driver.findById(decoded.userId).select('-password');
    }

    if (user) {
        res.status(200).json({ ...user._doc, role: decoded.role == 'driver' ? 'Driver' : 'Rider' });
    } else {
        res.status(404);
    }
};

const userPatch = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'rider') {
        user = await Rider.findByIdAndUpdate(decoded.userId, req.body, { new: true });
    } else if (decoded.role === 'driver') {
        user = await Driver.findByIdAndUpdate(decoded.userId, req.body, { new: true });
    }

    if (user) {
        res.status(200).json({ "message": "User updated successfully" });
    } else {
        res.status(404)
    }
};

const userDelete = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === 'rider') {
        user = await Rider.findByIdAndDelete(decoded.userId);
    } else if (decoded.role === 'driver') {
        user = await Driver.findByIdAndDelete(decoded.userId);
    }

    if (user) {
        res.status(200);
    } else {
        res.status(404);
    }
};

module.exports = {
    userGet,
    userDelete,
    userPatch
};
