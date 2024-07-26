// authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Rider = require('../models/riderModel');
const Driver = require('../models/driverModel');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    const { tkn, type } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: tkn,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user;
    if (type === 'rider') {
        user = await Rider.findOne({ email });
        if (!user) {
            user = new Rider({ email, profilePicture: picture });
            await user.save();
        }
    } else if (type === 'driver') {
        user = await Driver.findOne({ email });
        if (!user) {
            user = new Driver({ email, profilePicture: picture });
            await user.save();
        }
    }

    const token = jwt.sign({ userId: user._id, role: type }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    res.status(201).json({ token });
};

module.exports = {
    googleAuth,
};
