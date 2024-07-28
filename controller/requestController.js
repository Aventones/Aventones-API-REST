const Request = require('../models/requestModel');

// Create a new request
const requestPost = async (req, res) => {
    let request = new Request(req.body);

    request.rider = req.body.rider;
    request.rideDriver = req.body.rideDriver;
    request.ride = req.body.ride;

    if (request.rider && request.ride && request.rideDriver) {
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
        res.status(400).json({ error: 'No valid data provided for request, check information' });
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

module.exports = {
    requestPost,
    requestDelete
};
