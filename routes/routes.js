const express = require('express');
const router = express.Router()
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

