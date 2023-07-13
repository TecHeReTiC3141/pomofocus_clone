const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/User');

const passport = require('passport');
const initializePassport = require('../utils/initializePassport');
(async () => {
    await initializePassport(passport,
        async email => (await User.findOne({
            where: {
                email,
            }
        }))?.toJSON(),
        async id => (await User.findOne({
            where: {
                id,
            }
        }))?.toJSON()
    )
})();

const { checkAuthenticated, checkNotAuthenticated } = require('../utils/middleware');

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('users/login.ejs');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
}));

router.get('/signup', checkNotAuthenticated, (req, res) => {
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

router.delete('/logout', (req, res) => {
    req.logOut(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    })
})

module.exports = router;