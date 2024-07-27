const jwt = require('jsonwebtoken');
const Rider = require('../models/riderModel');
const Driver = require('../models/driverModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

const userPost = async (req, res) => {
    let user = new User();

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.cedula = req.body.cedula;
    user.dob = new Date(req.body.dob);
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.isDriver = req.body.isDriver;

    if (user.firstName && user.lastName && user.cedula && user.dob &&
        user.email && user.phone && req.body.password && user.isDriver != null) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                res.status(500).json({ error: 'Error generating salt' });
                return;
            }
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                if (err) {
                    res.status(500).json({ error: 'Error hashing password' });
                    return;
                }
                user.password = hash;

                user.save().then(() => {
                    res.header({
                        'Content-Type': 'application/json',
                        'Location': 'http://localhost:3001/user/' + user._id
                    })
                    res.status(201).json(user);
                }).catch((err) => {
                    res.header({
                        'Content-Type': 'application/json'
                    })
                    res.status(400).json({ error: 'Rider not created' });
                    console.log(err);
                });
            });
        });
    } else {
        res.status(400).json({ error: 'No valid data provided for user' });
    }
}

getUserCredentials = async (email) => {
    const user = await User.findOne({ email });
    return user;
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
    getUserCredentials,
    userDelete,
    userPatch,
    userPost
};
