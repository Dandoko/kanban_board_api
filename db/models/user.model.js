const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');

// JWT Secret Key
const jwtSecret = "Q3KZWdnaP3lGZnZoHIflKXg6q5EqnDTQpwP8K58XJUIk6K9TAV";

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

//=============================================================================
//=============================================================================
/* Instance Methods */
//=============================================================================
//=============================================================================

// Overriding the default toJSON method to only return specific fields every time when returning a User object
// Using a regular function instead of an arrow function to utilize the "this" keyword
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    
    // Return the document except the password and sessions
    return _.omit(userObject, ['password', 'sessions']); // Using Lodash library
}

// Creating the access token
UserSchema.methods.createAccessToken = function() {
    const user = this;
    return new Promise((res, rej) => {
        // Creating JWT
        jwt.sign({_id: user._id.toHexString()}, jwtSecret, {expiresIn: '15m'}, (err, accessToken) => {
            if (!err) res(accessToken);
            else rej();
        });
    });
}

// Creating the refresh token
UserSchema.methods.createRefreshToken = function() {
    // Generating a random 64byte string using the crypto library
    return new Promise((res, rej) => {
        crypto.randomBytes(64, (err, buffer) => {
            if (!err) {
                let refreshToken = buffer.toString('hex');
                return res(refreshToken);
            }
        });
    });
}

// Creates a session
UserSchema.methods.createSession = function() {
    let user = this;

    return user.createRefreshToken().then((refreshToken) => {
        return saveSession(user, refreshToken);
    }).then((refreshToken) => {
        // Saved the refresh token to the database successfully
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('API:db:models:createSession - Failed to save session to the database.\n' + e);
    });
}

//=============================================================================
//=============================================================================
/* Static Model Methods */
//=============================================================================
//=============================================================================

// Gets the JWT secret key
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

// Finds a user by an ID and the refresh token
UserSchema.statics.findByIdAndToken = function(_id, refreshToken) {
    const User = this;
    return User.findOne({
        _id,
        'sessions.refreshToken': refreshToken
    });
}

// Finds a user by its email and password
UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        else {
            return new Promise((res, rej) => {
                bcrypt.compare(password, user.password, (err, result)=> {
                    if (result) res(user);
                    else rej();
                });
            });
        }
    });
}

// Checks if the refresh token has expired
UserSchema.statics.isRefreshTokenExpired = (expiresAt) => {
    console.log("WASD");
    let secondsSinceEpoch = Date.now() / 1000;
    
    // Unexpired
    if (expiresAt > secondsSinceEpoch) return false;
    // Expired
    else return true;
}

//=============================================================================
//=============================================================================
/* Mongoose Middleware */
//=============================================================================
//=============================================================================

// Hashes the passwords using bcrypt when a User object is saved to MongoDB
UserSchema.pre('save', function(next) {
    let user = this;
    // The number of hashing rounds
    let costFactor = 10;

    // If the password field has been edited
    if (user.isModified('password')) {
        // Generates the salt
        bcrypt.genSalt(costFactor, (err, salt) => {
            // Hashes the password
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

//=============================================================================
//=============================================================================
/* Helper methods */
//=============================================================================
//=============================================================================

// Saving the session (refresh token + expiry time) to the database
let saveSession = (user, refreshToken) => {
    return new Promise((res, rej) => {
        let expiresAt = createRefreshTokenExpiryTime();

        // Pushes the object into the sessions array
        user.sessions.push({refreshToken, expiresAt});

        // Saving to the database
        user.save().then(() => {
            return res(refreshToken);
        }).catch((e) => {
            rej(e);
        });
    });
}

// Creates a UNIX timestamp for the expiry date of the refresh token
let createRefreshTokenExpiryTime = () => {
    const daysUntilExpire = "10"; // Setting to 10 days from now
    const secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);
module.exports = { User };