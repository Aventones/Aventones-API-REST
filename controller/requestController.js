const Request = require('../models/requestModel');

// Create a new request
const requestPost = async (req, res) => {
    let request = new Request(req.body);

    request.rider = req.body.rider;
    request.bookingDriver = req.body.driver;
    request.booking = req.body.booking;

    if (request.rider && request.booking) {
        request.save().then(() => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/reqaventon/' + request._id
            });
            res.status(201).json(request);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(400);
            console.log(err);
        });
    } else {
        res.header('Content-Type', 'application/json');
        res.status(400).json({ error: 'No valid data provided for request, check' });
    }
};

// Get requests
const requestGet = async (req, res) => {
    if (req.query && req.query.id) {
        Request.findById(req.query.id).populate({
            path: 'booking rider',
            select: '-__v -password'
        }).then((request) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/reqaventon/' + req.query.id
            });
            res.status(200).json(request);
        }).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404);
            console.log(err);
        });
    } else if (req.query && req.query.driver) {
        Request.find({ bookingDriver: req.query.driver }).populate({
            path: 'booking rider',
            select: '-__v -password'
        }).then((request) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/reqaventon/' + req.query.id
            });
            res.status(200).json(request);
        }
        ).catch((err) => {
            res.header('Content-Type', 'application/json');
            res.status(404);
            console.log(err);
        });
    } else {
        Request.find().populate({
            path: 'booking rider',
            select: '-__v -password'
        }).then((request) => {
            res.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:3001/reqaventon/' + req.query.id
            });
            res.status(200).json(request);
        }).catch((err) => {
            res.status(404);
            console.log(err);
        });
    }
};

// Delete a booking
const requestDelete = async (req, res) => {
    Request.findByIdAndDelete(req.query.id).then(() => {
        res.header('Content-Type', 'application/json');
        res.status(200).json({ alert: 'Request deleted' });
    }).catch((err) => {
        res.header('Content-Type', 'application/json');
        res.status(404);
        console.log(err);
    });
};

//Not a feature in the app yet.

// const bookingPatch = async (req, res) => {
//     let booking = req.body;

//     Request.findByIdAndUpdate(req.query.id, booking, { new: true }).then((updatedRequest) => {
//         res.header({
//             'Content-Type': 'application/json',
//             'Location': 'http://localhost:3001/request/' + booking._id
//         });
//         res.status(200).json(updatedRequest);
//     }).catch((err) => {
//         res.header('Content-Type', 'application/json');
//         res.status(400);
//         console.log(err);
//     });
// };

module.exports = {
    requestPost,
    requestGet,
    requestDelete
};
