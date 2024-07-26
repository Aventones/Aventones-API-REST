const Driver = require('../models/driverModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const driverPost = async (req, res) => {
    let driver = new Driver();

    driver.first_name = req.body.first_name;
    driver.last_name = req.body.last_name;
    driver.cedula = req.body.cedula;
    driver.dob = new Date(req.body.dob);
    driver.email = req.body.email;
    driver.phone = req.body.phone;
    driver.password = req.body.password;
    driver.make = req.body.make;
    driver.model = req.body.model;
    driver.year = req.body.year;
    driver.plate = req.body.plate;
    driver.seats = req.body.seats;

    if (driver.first_name && driver.last_name &&
        driver.cedula && driver.dob && driver.email &&
        driver.phone && req.body.password && driver.make &&
        driver.model && driver.year && driver.plate && driver.seats) {
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
                driver.password = hash;

                driver.save().then(() => {
                    res.header({
                        'Content-Type': 'application/json',
                        'Location': 'http://localhost:3001/driver/' + driver._id
                    })
                    res.status(201).json(driver);
                }).catch((err) => {
                    res.header('Content-Type', 'application/json');
                    res.status(400).json({ error: 'Driver not created' });
                    console.log(err);
                });
            });
        });
    }
    else {
        res.status(400).json({ error: 'No valid data provided for driver, check' });
    }
}

const driverGet = async (req, res) => {
    if (req.query && req.query.id) {
        Driver.findById(req.query.id).then((driver) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/driver/' + driver._id
            })
            res.status(200).json(driver);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404).json({ error: 'Driver not found' });
            console.log(err);
        });
    }
    else {
        Driver.find().then((drivers) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/driver/'
            })
            res.status(200).json(drivers);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404).json({ error: 'Drivers not found' });
            console.log(err);
        });
    }
}

const getDriverCredentials = async function (email) {
    return Driver.findOne({ email: email });
};

const driverDelete = async (req, res) => {
    Driver.findByIdAndDelete(req.query.id).then(() => {
        res.header('Content-Type', 'application/json');
        res.status(200).json({ alert: 'Driver deleted' });
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'Driver not deleted' });
        console.log(err);
    });
}

const driverPatch = async (req, res) => {
    let driver = new Driver();
    driver.first_name = req.body.first_name;
    driver.last_name = req.body.last_name;
    driver.cedula = req.body.cedula;
    driver.dob = new Date(req.body.dob);
    driver.email = req.body.email;
    driver.phone = req.body.phone;
    // driver.password = req.body.password;
    driver.make = req.body.make;
    driver.model = req.body.model;
    driver.year = req.body.year;
    driver.plate = req.body.plate;
    driver.seats = req.body.seats;

    if (req.body.first_name || req.body.last_name ||
        req.body.cedula || req.body.dob || req.body.email ||
        req.body.phone || req.body.make || req.body.plate ||
        req.body.model || req.body.year || req.body.seats) {
        Driver.findByIdAndUpdate(req.query.id, driver).then(() => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/driver/' + driver._id
            })
            res.status(200).json(driver);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(400).json({ error: 'Driver not updated' });
            console.log(err);
        });
    }
}

module.exports = {
    driverPost,
    driverGet,
    driverDelete,
    driverPatch,
    getDriverCredentials
}