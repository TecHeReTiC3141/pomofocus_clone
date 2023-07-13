const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User');

const passport = require('passport');
const initializePassport = require('../utils/initializePassport');
(async () => {
    await initializePassport(passport,
        async email => await User.findOne({
            where: {
                email,
            }
        }),
        async id => await User.findOne({
            where: {
                id,
            }
        })
    )
})();

router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});

router.post('/signup', async (req, res) => {
    try {
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
        })
        res.redirect('/users/login');
    } catch (err) {
        res.redirect('/users/signup');
    }
});

module.exports = router;