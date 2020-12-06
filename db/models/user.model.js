const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        refreshToken: {
           type: String,
           required: true 
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

require('../logic/user-auth')(UserSchema);

const User = mongoose.model('User', UserSchema);
module.exports = { User };