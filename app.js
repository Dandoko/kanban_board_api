const express = require('express');
const app = express();

// Body-Parser middleware
app.use(express.json());

app.use('/columns', require('./routes/column'));
app.use('/columns', require('./routes/tasks'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API:app.js: Server started on port ${PORT}`));