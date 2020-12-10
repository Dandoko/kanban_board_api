// Routes for columns

const express = require('express');
const router = express.Router();

const { Column, Task, User } = require('../db/models/index');

const authMiddleware = require('../middleware/auth-middleware');

// Gets all columns
router.get('/', authMiddleware.authenticate, (req, res) => {
    Column.find({
        _userId: req.user_id
    }).then((columns) => {
        res.send(columns);
    }).catch((e) => {
        res.send(e);
    });
})

// Creates a new column
router.post('/', authMiddleware.authenticate, (req, res) => {
    let title = req.body.title;

    let newColumn = new Column({
        title,
        _userId: req.user_id
    });

    newColumn.save().then((createdColumn) => {
        res.send(createdColumn);
    });
});

// Updates a column
router.put('/:id', authMiddleware.authenticate, (req, res) => {
    Column.findOneAndUpdate(
        {_id: req.params.id, _userId: req.user_id},
        {$set: req.body}
    ).then(() => {
        res.send({'message': 'api:routes:column.js - Updated Successfully'});
    });
});

// Deletes a column
router.delete('/:id', authMiddleware.authenticate, (req, res) => {
    Column.findOneAndRemove({_id: req.params.id, _userId: req.user_id}).then((removedColumn) => {
        res.send(removedColumn);
        deleteAllTasksFromColumn(removedColumn._id);
    });
});

// Helper method to delete all tasks in a column
let deleteAllTasksFromColumn = (_columnId) => {
    Task.deleteMany({_columnId});
}


module.exports = router;