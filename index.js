require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const routes = require('./routes/routes');
const User = require('./models/userModel');
const { userPost, getUserCredentials, userPatch } = require('./controller/userController');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const databaseURL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(databaseURL);

const db = mongoose.connection;
const aventones = express();

// Define a health check endpoint
app.use('/health', (req, res) => {
    res.status(200).send('OK'); // Respond with a status code of 200 and 'OK'
});

// Start the server on a specific port (e.g., 8080)
const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Middleware Setup
aventones.use(bodyParser.json({ limit: '3mb' }));
aventones.use(cookieParser());
aventones.use(cors({
    methods: 'GET,POST,DELETE,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express session middleware
aventones.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Initialize Passport and sessions
aventones.use(passport.initialize());
aventones.use(passport.session());

// Passport Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOrCreate({ googleId: profile.id }, {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
            });
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth login route
aventones.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback route
aventones.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET);
        res.cookie('token', token, { maxAge: 86400, httpOnly: true });
        res.redirect('/');
    }
);

// Allows registration of a new user
aventones.post('/user', userPost);

// Allows authentication of a user
aventones.post("/auth", async function (req, res, next) {
    if (req.body.email && req.body.password) {
        try {
            let user = await getUserCredentials(req.body.email);
            if (!user) {
                return res.status(401).json({ error: `Check your email` });
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: `Check your password` });
            }

            // No status check, allow all users to authenticate
            const payload = {
                userId: user._id,
                isDriver: user.isDriver,
                agent: req.get('user-agent')
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 });

            res.status(201).json({ token });
        } catch (error) {
            console.error("Auth Error:", error);
            res.status(500).json({ error: 'Internal server error', error });
        }
    } else {
        next();
    }
});

aventones.post("/verifyauth", (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ error: 'Invalid token', err });
        } else {
            res.status(200).json({ message: 'Valid token' });
        }
    });
});

// Middleware to check if the user is authenticated
aventones.use(function (req, res, next) {
    if (req.headers["authorization"]) {
        const authToken = req.headers['authorization'].split(' ')[1];
        try {
            jwt.verify(authToken, JWT_SECRET, (err, decodedToken) => {
                if (err || !decodedToken) {
                    res.status(401).json({ error: "Unauthorized" });
                }
                next();
            });
        } catch (e) {
            res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// New Patch route to update the user's status by ID
aventones.patch('/user/:id/status', async (req, res) => {
    try {
        const userId = req.params.id;
        const { statusUser } = req.body;

        if (!statusUser) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Find the user by their ID and update the statusUser field
        const updatedUser = await User.findByIdAndUpdate(userId, { statusUser: statusUser }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User status updated successfully', updatedUser });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Twilio OTP Endpoints

// Endpoint to send OTP
aventones.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const verification = await client.verify.v2.services(verifyServiceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully.',
            status: verification.status
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP.',
            error: error.message
        });
    }
});

// Endpoint to verify OTP
aventones.post('/verify-otp', async (req, res) => {
    const { phoneNumber, code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Missing required parameter: code' });
    }

    // Verify the JWT token to ensure the request is authenticated
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized, missing token' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }

        try {
            const verification_check = await client.verify.v2.services(verifyServiceSid)
                .verificationChecks
                .create({ to: phoneNumber, code: code });

            if (verification_check.status === 'approved') {
                res.status(200).json({
                    success: true,
                    message: 'OTP verified successfully.',
                    status: verification_check.status
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Invalid OTP or OTP expired.',
                    status: verification_check.status
                });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify OTP.',
                error: error.message
            });
        }
    });
});


// Serve static files (like favicon)
aventones.use(express.static('public'));

// Routes
aventones.use(routes);

// Server
aventones.listen(3001, () => {
    console.log('Server on port 3001');
});

// Database Connection
db.on('error', (error) => {
    console.log(error)
});

db.once('connected', () => {
    console.log('Database Connected');
});
