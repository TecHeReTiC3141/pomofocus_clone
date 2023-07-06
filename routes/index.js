const express = require('express');
const router = express.Router();

const Task = require('../models/Task');

router.get('/', async (req, res) => {
    const tasks = await Task.findAll();
    res.render('app.ejs', {tasks});
});

router.post('/new', async (req, res) => {
    const newTask = await Task.create({
        name: req.body.name,
        pomosNeed: req.body.pomosNeed,
    });
    res.redirect('/');
})

module.exports = router;