const express = require('express');
const router = express.Router();

const { getTask } = require('../utils/generateTemplates');

const Task = require('../models/Task');
const DoneTask = require('../models/DoneTask');
const {User, defaultUserSettings} = require("../models/User");

router.get('/', async (req, res) => {
    let tasks, totalPomosDone = 0, totalPomosNeed = 0;
    if (req.isAuthenticated()) {
        tasks = await Task.findAll({
            where: {
                UserId: req.user.id,
            }
        });
        totalPomosNeed = await Task.sum('pomosNeed', {
            where: {
                UserId: req.user.id,
                done: false,
            }
        }) || 0;
        totalPomosDone = await Task.sum('pomosDone', {
            where: {
                UserId: req.user.id,
                done: false,
            }
        }) || 0;

        const currentUser = await User.findOne({
            where: {
                id: req.user.id,
            }
        });
        let settings = JSON.parse(currentUser.settings), changed = false;

        for (let field in defaultUserSettings) {
            if (!(field in settings)) {
                settings = {
                    ...settings,
                    [field]: defaultUserSettings[field],
                };
                changed = true;
            }
        }

        if (changed) {
            await currentUser.update({
                settings: JSON.stringify(settings),
            });
            await currentUser.save();
        }

    } else {
        tasks = req.cookies.tasks || [];
    }

    res.render('app.ejs', {tasks, totalPomosDone,
        totalPomosNeed});
});

router.post('/new', async (req, res) => {
    try {
        const newTask = await Task.create({
            name: req.body.name,
            pomosNeed: req.body.pomosNeed,
            description: req.body.description,
            UserId: req.user.id,
        });
        res.send(newTask);
    } catch (err) {
        console.log(`Error while adding {err.message}`);
    }
})

router.get('/task_done/:id', async (req, res) => {
    try {
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
        console.log(`Error while adding done pomo: ${err.message}`);
        res.sendStatus(503);
    }
})

router.post('/save_task', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.send('User is not authenticated');
    }

    const curTaskStart = +req.body.startTime, curTaskFinish = +req.body.finishTime;
    try {
        const curUser = await User.findByPk(req.user.id);
        const lastTask = await DoneTask.findOne({
            where: {
                UserId: req.user.id,
            },
            order: [
                ['finishTime', 'DESC'],
            ],
            limit: 1,
        })
        if (lastTask && lastTask.name === req.body.name ) {
            const lastTaskFinish = lastTask.finishTime.getTime();
            if (curTaskStart - lastTaskFinish <= 5 * 60 * 1000) {
                const prevDur = lastTask.duration;
                await lastTask.update({
                    finishTime: new Date(curTaskFinish),
                })

                await curUser.increment('totalHoursFocused',
                    { by: lastTask.duration - prevDur })
                await lastTask.save();
                return res.send({ success: true });
            }
        }



        const doneTasksToday = await DoneTask.findAll({
            where: {
                UserId: req.user.id,
            }
        });
        let noTasksDoneToday = true;
        for (let task of doneTasksToday) {
            if (task.doneToday) {
                noTasksDoneToday = false;
                break;
            }
        }
        if (noTasksDoneToday) {
            console.log('No tasks today ')
            await curUser.increment('totalDaysAccessed',
                { by: 1 });
            let anyTasksDoneYesterday = false;

            for (let task of doneTasksToday) {

                if (task.doneYesterday) {
                    await curUser.increment('dayStreak',
                        { by: 1 });
                    anyTasksDoneYesterday = true;
                    console.log('New day in day streak')
                    break;
                }
            }

            if (!anyTasksDoneYesterday) {
                await curUser.update({ dayStreak: 1 });
                await curUser.save();
            }
        }

        const doneTask = await DoneTask.create({
            UserId: req.user.id,
            name: req.body.name,
            startTime: new Date(curTaskStart),
            finishTime: new Date(curTaskFinish),
        });

        await curUser.increment('totalHoursFocused',
            { by: doneTask.duration })
        res.send({
            success: true,
            totalHoursFocused: curUser.totalHoursFocused,
            totalDaysAccessed: curUser.totalDaysAccessed,
            dayStreak: curUser.dayStreak,
        });
    } catch (err) {
        console.log(`Error while saving task: ${err.message}`);
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

router.delete('/delete-finished-tasks', async (req, res) => {
    try {
        await Task.destroy({
            where: {
                done: true,
                UserId: req.user?.id,
            }
        });
        res.send({
            success: true,
        })
    } catch (err) {
        console.log(`Error while deleting finished task ${err.message}`);
        res.status(503);
    }
})

router.delete('/delete-all-tasks', async (req, res) => {
    try {
        await Task.destroy({
            where: {
                UserId: req.user?.id,
            }
        });
        res.send({
            success: true,
        })
    } catch (err) {
        console.log(`Error while deleting all task ${err.message}`);
        res.status(503);
    }
})

router.post('/clear-act-pomos', async (req, res) => {
    try {
        await Task.update({ pomosDone: 0 }, {
            where: {}
        });

        res.send({
            success: true,
        })
    } catch (err) {
        console.log(`Error while clearing act pomos ${err.message}`);
        res.status(503);
    }
})

module.exports = router;