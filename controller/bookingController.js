const Booking = require('../models/bookingModel');
const Driver = require('../models/driverModel');

// Get the number of seats available for a driver
const getDriverSeats = async (driverId) => {
    return new Promise((resolve, reject) => {
        Driver.findById(driverId).then((driver) => {
            resolve(driver.seats);
        }).catch((err) => {
            reject(err);
        }
        );
    });
};

// Create a new booking
const bookingPost = async (req, res) => {
    let booking = new Booking(req.body);

    booking.driver = req.body.driver;
    booking.destination = req.body.destination;
    booking.pickup = req.body.pickup;
    booking.days = req.body.days;
    booking.fee = req.body.fee;
    booking.time = req.body.time;
    booking.seatsAvailable = req.body.seatsAvailable;

    if (booking.driver && booking.pickup &&
        booking.destination && booking.days &&
        booking.fee && booking.pickup &&
        booking.time && booking.seatsAvailable &&
        booking.seatsAvailable <= await getDriverSeats(booking.driver)) {
        booking.save().then(() => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/booking/' + booking._id
            });
            res.status(201).json(booking);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(400);
            console.log(err);
        });
    } else {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'No valid data provided for booking, check' });
    }
};

// Get bookings
const bookingGet = async (req, res) => {
    if (req.query && req.query.id) {
        Booking.findById(req.query.id).populate({
            path: 'driver riders',
            select: '-__v -password'
        }).then((booking) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/booking/' + req.query.id
            });
            res.status(200).json(booking);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404);
            console.log(err);
        });
    } else if (req.query && req.query.driver) {
        Booking.find({ driver: req.query.driver }).populate({
            path: 'driver riders',
            select: '-__v -password'
        }).then((booking) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/booking/' + req.query.id
            });
            res.status(200).json(booking);
        }
        ).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404);
            console.log(err);
        });
    } else {
        Booking.find().populate({
            path: 'driver riders',
            select: '-__v -password'
        }).then((booking) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/booking/' + booking._id
            });
            res.status(200).json(booking);
        }).catch((err) => {
            res.status(404);
            console.log(err);
        });
    }
};

// Delete a booking
const bookingDelete = async (req, res) => {
    Booking.findByIdAndDelete(req.query.id).then(() => {
        res.header('Content-Type', 'application/json');
        res.status(200).json({ alert: 'Booking deleted' });
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(404);
        console.log(err);
    });
};


const bookingPatch = async (req, res) => {
    let booking = req.body;

    Booking.findByIdAndUpdate(req.query.id, booking, { new: true }).then((updatedBooking) => {
        res.header({
            'Content-Type': 'application/json',
            'Location': 'http://localhost:3001/booking/' + booking._id
        });
        res.status(200).json(updatedBooking);
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(400);
        console.log(err);
    });
};

module.exports = {
    bookingPost,
    bookingGet,
    bookingDelete,
    bookingPatch
};
