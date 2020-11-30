// Routes for tasks 

const express = require('express');
const router = express.Router();

const { mongoose } = require('../db/mongoose');

// Importing the mongoose models
const { Column, Task } = require('../db/models/index');

// Getting all tasks in a specified column
router.get('/:columnId/tasks', (req, res) => {
    Task.find({_columnId: req.params.columnId}).then((tasks) => {
        res.send(tasks);
    });
})

// Creating a new task in a specified column
router.post('/:columnId/tasks', (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        _columnId: req.params.columnId
    });

    newTask.save().then(createdTask => {
        res.send(createdTask);
    });
});

// Updating a specified task
router.put('/:columnId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate(
        {
            _id: req.params.taskId,
            _columnId: req.params.columnId
        },
        {
            $set: req.body
        }
    ).then(() => {
        res.sendStatus(200);
    });
});

// Deleting a specified task
router.delete('/:columnId/tasks/:taskId', (req, res) => {
    Task.findOneAndRemove(
        {
            _id: req.params.taskId,
            _columnId: req.params.columnId
        }
    ).then((removedTask) => {
        res.send(removedTask);
    });
});


module.exports = router;