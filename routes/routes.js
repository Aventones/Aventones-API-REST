const express = require('express');
const router = express.Router()
const passport = require('passport');
module.exports = router;

const { ridePost, rideDelete, ridePatch } = require('../controller/rideController');
const { requestPost, requestDelete } = require('../controller/requestController');
const { userDelete, userPatch } = require('../controller/userController');

router.post('/ride/', ridePost);
router.delete('/ride/', rideDelete);
router.patch('/ride/', ridePatch);

router.delete('/user', userDelete);
router.patch('/user', userPatch);

router.post('/reqaventon', requestPost);
router.delete('/reqaventon', requestDelete);

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Successful authentication, redirect to the appropriate page
    res.redirect('/register'); // You can customize this redirect
  }
);

