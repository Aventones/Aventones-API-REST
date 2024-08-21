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
const User = require('./models/userModel'); // Ensure this is your User model
const router = express.Router();
module.exports = router;

const databaseURL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(databaseURL);

const db = mongoose.connection;
const aventones = express();

// Middleware Setup
aventones.use(bodyParser.json({ limit: '3mb' }));
aventones.use(cookieParser());
aventones.use(cors({
    methods: 'GET,POST,DELETE,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express session middleware
aventones.use(session({
    secret: process.env.SESSION_SECRET, // Ensure this is set in your .env file
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

// Controllers Imports
const { userPost, getUserCredentials } = require('./controller/userController');

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

            console.log("Fetched User:", user); // Debugging: log the fetched user details

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: `Check your password` });
            }

            // Include the status check
            if (user.status !== 'verified') {
                return res.status(403).json({ error: 'Account not verified' });
            }

            const payload = {
                userId: user._id,
                isDriver: user.isDriver,
                agent: req.get('user-agent')
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 86400 });

            res.status(201).json({ token, status: user.status });
        } catch (error) {
            console.error("Auth Error:", error); // Log any errors
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
