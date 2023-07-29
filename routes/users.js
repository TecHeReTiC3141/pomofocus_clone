const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const querystring = require('querystring');

const {User, defaultUserSettings} = require('../models/User');
const DoneTask = require('../models/DoneTask');

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


const {checkAuthenticated, checkNotAuthenticated} = require('../utils/middleware');

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('users/login.ejs');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: `/?${
        querystring.stringify({
            message_type: 'success',
            message_title: 'Login Success',
            message_body: 'Continue using site',
        })
    }`,
    failureRedirect: `/users/login?${
        querystring.stringify({
            message_type: 'error',
            message_title: 'Login Error',
            message_body: 
                'Could not find user with such credentials. ' +
                'Please check password or email',
        })
    }`,
    failureFlash: true,
}));

router.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('users/signup.ejs');
});

router.post('/signup', async (req, res) => {
    console.log('signup', req.body);
    try {
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            avatar: req.body.avatar || '/images/user-icon.png',
        })
        const message = querystring.stringify({
            message_type: 'success',
            message_title: 'Signup Success',
            message_body: 'Thank you for signup.' +
                ' Hope your productivity skyrockets soon',
        })
        res.redirect(`/users/login?${message}`);
    } catch (err) {
        res.redirect('/users/signup');
    }
});

router.post('/create_user', async (req, res) => {
    console.log('signup', req.body);
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
            avatar: req.body.avatar || '/images/user-icon.png',
        })
        res.send({
            success: true,
            newUser
        });
    } catch (err) {
        res.send({ success: false});
    }
});

router.delete('/logout', checkAuthenticated, (req, res) => {
    req.logOut(err => {
        if (err) {
            console.log(err);
        }
        const message = querystring.stringify({
            message_type: 'info',
            message_title: 'Log out',
            message_body: `You are logged out now. Don't forget to log in again`
        })
        res.send(`/users/login?${message}`);
    })
})

router.delete('/delete', checkAuthenticated, async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.user.id,
            }
        })
        req.logOut(err => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        })
    } catch (err) {
        console.log(`Error while deleting user: ${err.message}`);
        res.redirect('/');
    }

})

router.post('/update/:id', async (req, res) => {
    let message;
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id,
            }
        })
        const newAvatar = req.file;

        await user.update({
            name: req.body.name,
        })
        if (newAvatar) {
            await user.update({
                avatar: `/uploads/${newAvatar.filename}`,
            })
        }
        await user.save();

        message = querystring.stringify({
            message_type: 'success',
            message_title: 'User Updated',
            message_body: 'Your profile successfully updated',
        })
    } catch (err) {
        console.log(`Error while updating user: ${err.message}`);
        message = querystring.stringify({
            message_type: 'error',
            message_title: 'User Update Fail',
            message_body: `Your profile wasn't updated. Sorry`,
        })

    } finally {
        res.redirect(`/?${message}`);
    }
});

router.get('/get_user_settings', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send(defaultUserSettings)
    }
    res.send(JSON.parse(req.user.settings));
})

router.post('/update_user_settings', async (req, res) => {
    try {
        const curUser = await User.findOne({
            where: {
                id: req.user.id,
            }
        })
        await curUser.update({
            settings: JSON.stringify(req.body.settings),
        })
        await curUser.save();
        res.send({ success: true});
    } catch (err) {
        console.log(`Error while updating user settings: ${err.message}`);
        res.send({ success: false });
    }

})

router.get('/get_done_tasks', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send({
            success: false,
        })
    }
    try {
        const doneTasks = await DoneTask.findAll({
            where: {
                UserId: req.user.id,
            },
            order: [
                ['finishTime', 'DESC'],
            ],
            attributes: ['name', 'startTime', 'finishTime', 'duration'],
        })
        res.send({
            success: true,
            data: doneTasks,
        })
    } catch (err) {
        console.log(`Error while getting user done tasks: ${err.message}`);
        res.send({ success: false });
    }
})

router.get('/get_top_users', async (req, res) => {
    try {
        const users = await User.findAll();
        const usersTop = [];
        for (let user of users) {
            const doneTasksThisWeek = await DoneTask.findAll({
                where: {
                    UserId: user.id,
                },
            })
            let totalFocusTime = 0;
            for (let task of doneTasksThisWeek) {
                totalFocusTime += task.duration * task.doneLast7Days;
            }
            usersTop.push({
                avatar: user.avatar,
                name: user.name,
                totalFocusTime,
            });
        }
        console.log(usersTop);
        usersTop.sort((u1, u2) =>
            u2.totalFocusTime - u1.totalFocusTime);
        res.send({
            success: true,
            usersTop
        })

    } catch (err) {
        console.log(`Error while getting top users: ${err.message}`);
        res.send({ success: false });
    }
})

module.exports = router;