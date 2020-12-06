// Combines all models to make importing easier

const { Task } = require('./task.model');
const { Column } = require('./column.model');
const { User } = require('./user.model');

module.exports = { Task, Column, User };