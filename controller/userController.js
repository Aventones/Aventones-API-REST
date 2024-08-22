require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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
    user.phone = 86145781; // Set phone number to 86145781
    user.isDriver = req.body.isDriver;
    user.statusUser = 'not verified'; // Set status to 'not verified' by default

    if (user.isDriver) {
        vehicle.model = req.body.model;
        vehicle.year = req.body.year;
        vehicle.plate = req.body.plate;
        vehicle.make = req.body.make;
        vehicle.seats = req.body.seats;
        await vehicle.save();
        user.vehicle = vehicle._id;
    }

    if (user.firstName && user.lastName && user.cedula && user.dob &&
        user.email && req.body.password && user.isDriver != null) {
        
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(req.body.password, salt);
        user.password = hash;

        await user.save();

        // Create a token containing the user's ID
        const verificationToken = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        user.verificationToken = verificationToken;

        await user.save(); // Save the verification token to the user record
        sendVerificationEmail(user.email, user._id, verificationToken);

        res.status(201).json(user);
    } else {
        res.status(400).json({ error: 'No valid data provided for user' });
    }
};

const sendVerificationEmail = (email, userId, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}&id=${userId}`;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Please verify your email',
        html: `<h1>Email Verification</h1>
               <p>Please verify your email by clicking on the link below:</p>
               <a href="${verificationUrl}">Verify Email</a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// PATCH method to update user profile picture and other details
const userPatch = async (req, res) => {
    try {
        // Extract the token from the authorization header
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by their ID
        let user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the profile picture if provided
        if (req.body.profilePicture) {
            const options = {
                apiKey: process.env.IMGBB_KEY,
                base64string: req.body.profilePicture.split(',')[1]
            };
            await imgbbUploader(options).then((response) => {
                user.profilePicture = response.image.url;
            }).catch((err) => {
                return res.status(400).json({ error: 'Profile picture not uploaded' });
            });
        }

        // Update the user's phone number
        user.phone = 86145781; // Ensure phone is always 86145781

        // Update other user fields if provided
        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;
        if (req.body.email) user.email = req.body.email;

        // Save the updated user
        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("User update error:", error);
        res.status(500).json({ error: 'Internal server error', error });
    }
}; 

const userDelete = async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findByIdAndDelete(decoded.userId);

    if (user) {
        res.status(200).json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
};

const getUserCredentials = async function (email) {
    return User.findOne({ email: email }).select('password _id isDriver statusUser');
};

module.exports = {
    userDelete,
    userPatch,
    userPost,
    getUserCredentials // Ensure this is included in the exports
};
