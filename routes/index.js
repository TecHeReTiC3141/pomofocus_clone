const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let tasks = [{
        done: false,
        name: 'Task something',
        pomosDone: 0,
        pomosNeed: 1,
    }];

    res.render('app.ejs', {tasks});
});

module.exports = router;