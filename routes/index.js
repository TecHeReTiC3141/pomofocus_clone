const express = require('express');
const router = express.Router();

const { getTask } = require('../utils/generateTemplates');

const Task = require('../models/Task');

router.get('/', async (req, res) => {
    const tasks = await Task.findAll();
    const totalPomosNeed = await Task.sum('pomosNeed', {
        where: {
            done: false,
        }
    })
    const totalPomosDone = await Task.sum('pomosDone', {
        where: {
            done: false,
        }
    })
    res.render('app.ejs', {tasks, totalPomosDone, totalPomosNeed});
});

router.post('/new', async (req, res) => {
    try {
        const newTask = await Task.create({
            name: req.body.name,
            pomosNeed: req.body.pomosNeed,
            description: req.body.description,
        });
        res.send(getTask(newTask));
    } catch (err) {
        console.log(`$Error while adding {err.message}`);
    }

})

router.get('/task_done/:id', async (req, res) => {
    try {
        console.log(req.params);
        const curTask = await Task.findOne({
            where: {
                id: req.params.id,
            }
        })
        await curTask.update({
            pomosDone: curTask.pomosDone + 1,
            pomosNeed: curTask.pomosNeed === curTask.pomosDone ? curTask.pomosNeed + 1 : curTask.pomosNeed,
        })
        await curTask.save()
        res.send({
            pomosDone: curTask.pomosDone,
            pomosNeed: curTask.pomosNeed,
        })
    } catch (err) {
        console.log(`Error while adding done pomo ${err.message}`);
        res.sendStatus(503);
    }
})

router.get('/toggle_done/:id', async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
            }
        })
        await task.update({
            done: !task.done,
        });
        await task.save();
        res.send({
            success: true,
        });
    } catch (err) {
        console.log(`Error while setting task done ${err.message}`);
        res.sendStatus(503);
    }

})

router.put('/update', async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.body.id,
            }
        });
        await task.update({
            name: req.body.name,
            pomosNeed: req.body.pomosNeed,
            description: req.body.description,
        });
        await task.save();
        res.send(task);
    } catch (err) {
        console.log(`Error while updating task ${err.message}`);
        res.status(503);
    }
})

router.delete('/delete', async (req, res) => {
    try {
        await Task.destroy({
            where: {
                id: req.body.id,
            }
        });
        res.send({
            deleted: true,
        })
    } catch (err) {
        console.log(`Error while deleting task ${err.message}`);
        res.status(503);
    }

})

module.exports = router;