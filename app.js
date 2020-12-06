const express = require('express');
const app = express();

// Loading mongoose into the application
const { mongoose } = require('./db/mongoose');

// Body-Parser middleware
app.use(express.json());

const corsMiddleware = require('./middleware/cors-middleware');
app.use(corsMiddleware);

app.use('/columns', require('./routes/column'));
app.use('/columns', require('./routes/task'));
app.use('/users', require('./routes/user'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API:app.js: Server started on port ${PORT}`));