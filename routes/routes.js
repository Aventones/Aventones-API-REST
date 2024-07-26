const express = require('express');
const router = express.Router()
module.exports = router;

const { bookingPost, bookingGet, bookingDelete, bookingPatch } = require('../controller/bookingController');
const { requestPost, requestGet, requestDelete } = require('../controller/requestController');
const { driverGet, driverDelete, driverPatch } = require('../controller/driverController');
const { riderGet, riderDelete, riderPatch } = require('../controller/riderController');
const { userGet, userDelete, userPatch } = require('../controller/userController');

router.get('/driver/', driverGet);
router.delete('/driver/', driverDelete);
router.patch('/driver/', driverPatch);

router.get('/rider/', riderGet);
router.delete('/rider/', riderDelete);
router.patch('/rider/', riderPatch);

router.post('/booking/', bookingPost);
router.get('/booking/', bookingGet);
router.delete('/booking/', bookingDelete);
router.patch('/booking/', bookingPatch);

router.get('/user', userGet);
router.delete('/user', userDelete);
router.patch('/user', userPatch);

router.post('/reqaventon', requestPost);
router.get('/reqaventon', requestGet);
router.delete('/reqaventon', requestDelete);

