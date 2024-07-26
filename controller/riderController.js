const Rider = require('../models/riderModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Create a new rider
const riderPost = async (req, res) => {
    let rider = new Rider();

    rider.first_name = req.body.first_name;
    rider.last_name = req.body.last_name;
    rider.cedula = req.body.cedula;
    rider.dob = new Date(req.body.dob);
    rider.email = req.body.email;
    rider.phone = req.body.phone;

    if (rider.first_name || rider.last_name || rider.cedula || rider.dob || rider.email || rider.phone || req.body.password) {
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
                rider.password = hash;

                rider.save().then(() => {
                    res.header({
                        'Content-Type': 'application/json',
                        'Location': 'http://localhost:3001/rider/' + rider._id
                    })
                    res.status(201).json(rider);
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
        res.status(400).json({ error: 'No valid data provided for rider' });
    }
}

const getRiderCredentials = async function (email) {
    return Rider.findOne({ email: email});
};

// Get riders
const riderGet = async (req, res) => {
    if (req.query && req.query.id) {
        Rider.findById(req.query.id).then((rider) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/rider/' + rider._id
            })
            res.status(200).json(rider);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404).json({ error: 'Rider not found' });
            console.log(err);
        });
    }
    else {
        Rider.find().then((riders) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/rider/'
            })
            res.status(200).json(riders);
        }).catch((err) => {
            // res.header('Content-Type', 'application/json');
            res.status(404).json({ error: 'Riders not found' });
            console.log(err);
        });
    }
}

// Delete a rider
const riderDelete = async (req, res) => {
    Rider.findByIdAndDelete(req.query.id).then(() => {
        res.header('Content-Type', 'application/json');
        res.status(200).json({ alert: 'Rider deleted' });
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'Rider not deleted' });
        console.log(err);
    });
}

// Partially update a rider
const riderPatch = async (req, res) => {
    let rider = req.body;

    Rider.findByIdAndUpdate(req.query.id, rider, { new: true }).then((updatedRider) => {
        res.header('Location', 'http://localhost:3001/rider/' + req.query.id);
        res.header('Content-Type', 'application/json');
        res.status(200).json(updatedRider);
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'Rider not updated' });
        console.log(err);
    });
}

module.exports = {
    riderPost,
    riderGet,
    riderDelete,
    riderPatch,
    getRiderCredentials
}

