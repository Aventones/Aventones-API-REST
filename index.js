require('dotenv').config();
const databaseURL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const routes = require('./routes/routes');
const router = express.Router();
module.exports = router;

mongoose.connect(databaseURL);

const db = mongoose.connection;
const aventones = express();

aventones.use(bodyParser.json({ limit: '3mb' }));
aventones.use(cookieParser());
aventones.use(cors({
    methods: 'GET,POST,DELETE,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//Controllers Imports
const { userPost, getUserCredentials } = require('./controller/userController');

//Allows registration of a new user
aventones.post('/user', userPost);

//Allows authentication of a user
aventones.post("/auth", async function (req, res, next) {
    if (req.body.email && req.body.password) {
        try {
            let user = await getUserCredentials(req.body.email);
            if (!user) {
                res.status(401).json({ error: `Check your email` });
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                res.status(401).json({ error: `Check your password` });
            }
            const payload = {
                userId: user._id,
                isDriver: user.isDriver,
                agent: req.get('user-agent')
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 });

            res.status(201).json({ token });
        } catch (error) {
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

//Middleware to check if the user is authenticated
aventones.use(function (req, res, next) {
    if (req.headers["authorization"]) {
        const authToken = req.headers['authorization'].split(' ')[1];
        try {
            jwt.verify(authToken, JWT_SECRET, (err, decodedToken) => {
                if (err || !decodedToken) {
                    res.status(401);
                    res.json({
                        error: "Unauthorized"
                    });
                }
                next();
            });
        } catch (e) {
            res.status(401);
            res.send({
                error: "Unauthorized"
            });
        }

    } else {
        res.status(401);
        res.send({
            error: "Unauthorized"
        });
    }
});

//Routes
aventones.use(routes);

//Server
aventones.listen(3001, () => {
    console.log('Server on port 3001');
});

//Database Connection
db.on('error', (error) => {
    console.log(error)
})

db.once('connected', () => {
    console.log('Database Connected');
})