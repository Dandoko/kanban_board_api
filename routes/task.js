// Routes for tasks 

const express = require('express');
const router = express.Router();

const { Column, Task } = require('../db/models/index');

const authMiddleware = require('../middleware/auth-middleware');

// Getting all tasks in a specified column in ascending order of position
router.get('/:columnId/tasks', authMiddleware.authenticate, (req, res) => {
    Task.find({ _columnId: req.params.columnId }).sort({ "position": 1 }).then(tasks => {
        res.send(tasks);
    });
});

// Creating a new task in a specified column
router.post('/:columnId/tasks', authMiddleware.authenticate, (req, res) => {
    hasAccessToColumn(req).then(canCreateTask => {
        if (canCreateTask) {
            Task.countDocuments({ _columnId: req.params.columnId }).then(numTasks => {
                let newTask = new Task({
                    title: req.body.title,
                    _columnId: req.params.columnId,
                    position: numTasks
                });
            
                newTask.save().then(createdTask => {
                    res.send(createdTask);
                });
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

// Updating a specified task
router.put('/:columnId/tasks/:taskId', authMiddleware.authenticate, (req, res) => {
    hasAccessToColumn(req).then(canUpdateTask => {
        if (canUpdateTask) {
            Task.findOneAndUpdate(
                { _id: req.params.taskId, _columnId: req.params.columnId },
                { $set: req.body }
            ).then(() => {
                res.send({message: 'API:routes:tasks.js:router.put() - Updated Successfully'});
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

// Moving a task
router.put('/:columnId/tasks/:taskId/moveTask', authMiddleware.authenticate, (req, res) => {
    hasAccessToColumn(req).then(canUpdateTask => {
        if (canUpdateTask) {
            // Decreasing the position of the tasks in the previous column that are greater than the task-to-move
            Task.updateMany(
                { _columnId: req.params.columnId, position: { $gt: req.body.prevColumnIndex } },
                { $inc: { position: -1 } }
            ).then(() => {
                // Increasing the position of the tasks in the new column that are greater than the task-to-move
                Task.updateMany(
                    { _columnId: req.body.newColumnId, position: { $gt: req.body.newColumnIndex - 1 } },
                    { $inc: { position: +1 } }
                ).then(() => {
                    // Updating the task
                    Task.findOneAndUpdate(
                        { _id: req.params.taskId, _columnId: req.params.columnId },
                        { $set: { _columnId: req.body.newColumnId, position: req.body.newColumnIndex } }
                    ).then(() => {
                        res.send({ message: 'API:routes:tasks.js:router.put() - Updated Successfully' });
                    });
                });
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

// Deleting a specified task
router.delete('/:columnId/tasks/:taskId', authMiddleware.authenticate, (req, res) => {
    hasAccessToColumn(req).then(canDeleteTask => {
        if (canDeleteTask) {
            Task.findOneAndRemove(
                { _id: req.params.taskId, _columnId: req.params.columnId }
            ).then(removedTask => {
                Task.updateMany(
                    { _columnId: req.params.columnId, position: { $gt: removedTask.position } },
                    { $inc: { position: -1 } }
                ).then(() => {
                    res.send(removedTask);
                })
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

// Checking if the user has access to the columnId passed in the request
let hasAccessToColumn = req => {
    return Column.findOne({
        _id: req.params.columnId,
        _userId: req.user_id
    }).then(column => {
        if (column) return true;
        else return false;
    });
}

module.exports = router;