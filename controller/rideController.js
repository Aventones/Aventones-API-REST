const Ride = require('../models/rideModel');
const User = require('../models/userModel');
const Vehicle = require('../models/vehicleModel');

// Get the number of seats available for a driver base on the Id vehicle insdide
const getVehicleSeats = async (userId) => {
    let user = await User.findById(userId);
    let vehicle = await Vehicle.findById(user.vehicle);
    return vehicle.seats;
};

// Create a new booking
const ridePost = async (req, res) => {
    let ride = new Ride(req.body);

    ride.driver = req.body.driver;
    ride.destination = req.body.destination;
    ride.pickup = req.body.pickup;
    ride.days = req.body.days;
    ride.fee = req.body.fee;
    ride.time = req.body.time;
    ride.seatsAvailable = req.body.seatsAvailable;

    if (ride.driver && ride.pickup &&
        ride.destination && ride.days &&
        ride.fee && ride.pickup &&
        ride.time && ride.seatsAvailable &&
        ride.seatsAvailable <= await getVehicleSeats(ride.driver)) {
        ride.save().then(() => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/ride/' + ride._id
            });
            res.status(201).json(ride);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(400);
            console.log(err);
        });
    } else {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'No valid data provided for ride, check information' });
    }
};

// Delete a booking
const rideDelete = async (req, res) => {
    Ride.findByIdAndDelete(req.query.id).then(() => {
        res.header('Content-Type', 'application/json');
        res.status(200).json({ alert: 'Ride deleted' });
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(404);
        console.log(err);
    });
};

const ridePatch = async (req, res) => {
    let ride = req.body;

    Ride.findByIdAndUpdate(req.query.id, ride, { new: true }).then((updatedRide) => {
        res.header({
            'Content-Type': 'application/json',
            'Location': 'http://localhost:3001/booking/' + ride._id
        });
        res.status(200).json(updatedRide);
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(400);
        console.log(err);
    });
};

module.exports = {
    ridePost,
    rideDelete,
    ridePatch
};
