require('dotenv').config();
const jwt = require('jsonwebtoken');
const imgbbUploader = require("imgbb-uploader");
const User = require('../models/userModel');
const Vehicle = require('../models/vehicleModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userPost = async (req, res) => {
    let user = new User();
    let vehicle = new Vehicle();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.cedula = req.body.cedula;
    user.dob = new Date(req.body.dob);
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.isDriver = req.body.isDriver;

    if (user.isDriver) {
        vehicle.model = req.body.model;
        vehicle.year = req.body.year;
        vehicle.plate = req.body.plate;
        vehicle.make = req.body.make;
        vehicle.seats = req.body.seats;
        vehicle.save().then(() => {
            user.vehicle = vehicle._id;
        }
        ).catch((err) => {
            res.status(400).json({ error: 'Vehicle not created' });
            console.log(err);
        });
        user.vehicle = vehicle._id;
    }
    console.log(user._id);
    console.log(vehicle._id);
    console.log(user.vehicle);

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
                    res.status(400).json({ error: 'User not created' });
                    console.log(err);
                });
            });
        });
    } else {
        res.status(400).json({ error: 'No valid data provided for user' });
    }
}

const getUserCredentials = async function (email) {
    return User.findOne({ email: email }).select('password _id isDriver');
};

const userPatch = async (req, res) => {
    let user = new User();
    user = req.body;
    const options = {
        apiKey: process.env.IMGBB_KEY,
        base64string: req.body.profilePicture.split(',')[1]
    };
    await imgbbUploader(options).then((response) => {
        user.profilePicture = response.image.url;
    }
    ).catch((err) => {
        res.status(400).json({ error: 'Profile picture not uploaded' });
        console.log(err);
    });

    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updatedUser = await User.findByIdAndUpdate(decoded.userId, user, { new: true });

    if (updatedUser) {
        res.status(200).json(updatedUser);
    } else {
        res.status(404)
    }
};

const userDelete = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findByIdAndDelete(decoded.userId);

    if (user) {
        res.status(200);
    } else {
        res.status(404);
    }
};

module.exports = {
    getUserCredentials,
    userDelete,
    userPatch,
    userPost
};
