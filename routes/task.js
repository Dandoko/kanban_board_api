// Routes for tasks 

const express = require('express');
const router = express.Router();

const { Column, Task, User } = require('../db/models/index');

const authMiddleware = require('../middleware/auth-middleware');

// Getting all tasks in a specified column
router.get('/:columnId/tasks', authMiddleware.authenticate, (req, res) => {
    Task.find({_columnId: req.params.columnId}).then((tasks) => {
        res.send(tasks);
    });
})

// Creating a new task in a specified column
router.post('/:columnId/tasks', authMiddleware.authenticate, (req, res) => {

    // Checking if the user has access to the columnId passed in the request
    Column.findOne({
        _id: req.params.columnId,
        _userId: req.user_id
    }).then((column) => {
        if (column) return true;
        else return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _columnId: req.params.columnId
            });
        
            newTask.save().then(createdTask => {
                res.send(createdTask);
            });
        }
        else {
            res.sendStatus(401);
        }
    })
});

// Updating a specified task
router.put('/:columnId/tasks/:taskId', authMiddleware.authenticate, (req, res) => {
    Column.findOne({
        _id: req.params.columnId,
        _userId: req.user_id
    }).then((column) => {
        if (column) return true;
        else return false;
    }).then((canUpdateTask) => {
        if (canUpdateTask) {
            Task.findOneAndUpdate(
                {_id: req.params.taskId, _columnId: req.params.columnId},
                {$set: req.body}
            ).then(() => {
                res.send({message: 'API:routes:tasks.js:router.put() - Updated Successfully'});
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

// Deleting a specified task
router.delete('/:columnId/tasks/:taskId', authMiddleware.authenticate, (req, res) => {
    Column.findOne({
        _id: req.params.columnId,
        _userId: req.user_id
    }).then((column) => {
        if (column) return true;
        else return false;
    }).then((canDeleteTask) => {
        if (canDeleteTask) {
            Task.findOneAndRemove(
                {_id: req.params.taskId, _columnId: req.params.columnId}
            ).then((removedTask) => {
                res.send(removedTask);
            });
        }
        else {
            res.sendStatus(401);
        }
    });
});

module.exports = router;