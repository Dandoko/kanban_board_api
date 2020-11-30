const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    // _ (underscore) is used as a convention to show this field contains an ObjectId
    _columnId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = { Task };