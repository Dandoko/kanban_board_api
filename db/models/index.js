// Combines all models to make importing easier

const { Task } = require('./task.model');
const { Column } = require('./column.model');

module.exports = { Task, Column };