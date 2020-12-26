// Handles the connection to the MongoDB database

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/KanbanBoard', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('API:db:mongoose.js: Connected to MongoDB');
}).catch(e => {
    console.log('API:db:mongoose.js: Failed to connect to MongoDB');
    console.log(e);
});

// Preventing deprecation warnings
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = { mongoose };