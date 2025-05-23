const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

router.put('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists!');
                    }
                });
            }),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login);

router.post('/status', isAuth ,authController.getUserStatus);

router.patch('/status', isAuth, [
    body('status')
        .trim()
        .not()
        .isEmpty()
    ],
    authController.updateUserStatus
);

module.exports = router;