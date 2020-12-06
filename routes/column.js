// Routes for columns

const express = require('express');
const router = express.Router();

// Importing the mongoose models
const { Column, Task } = require('../db/models/index');

// Gets all columns
router.get('/', (req, res) => {
    Column.find({}).then((columns) => {
        res.send(columns);
    });
})

// Creates a new column
router.post('/', (req, res) => {
    let title = req.body.title;

    let newColumn = new Column({
        title
    });

    newColumn.save().then((createdColumn) => {
        res.send(createdColumn);
    });
});

// Updates a column
router.put('/:id', (req, res) => {
    Column.findOneAndUpdate(
        {_id: req.params.id},
        {$set: req.body}
    ).then(() => {
        res.sendStatus(200);
    });
});

// Deletes a column
router.delete('/:id', (req, res) => {
    Column.findOneAndRemove({_id: req.params.id}).then((removedColumn) => {
        res.send(removedColumn);
    });
});


module.exports = router;