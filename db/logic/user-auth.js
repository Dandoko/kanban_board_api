const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');

// JWT Secret Key
const jwtSecret = "Q3KZWdnaP3lGZnZoHIflKXg6q5EqnDTQpwP8K58XJUIk6K9TAV";

module.exports = function(UserSchema) {
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
        
        // Return the User object except the password and sessions using the Lodash library
        return _.omit(userObject, ['password', 'sessions']);
    }

    // Creating the access token
    UserSchema.methods.createAccessToken = function() {
        const user = this;
        return new Promise((resolve, reject) => {
            // Creating JWT
            jwt.sign({_id: user._id.toHexString()}, jwtSecret, {expiresIn: '15m'}, (err, accessToken) => {
                if (!err) resolve(accessToken);
                else reject();
            });
        });
    }

    // Creating the refresh token
    UserSchema.methods.createRefreshToken = function() {
        // Generating a random 64byte string using the crypto library
        return new Promise((resolve, reject) => {
            crypto.randomBytes(64, (err, buffer) => {
                if (!err) {
                    let refreshToken = buffer.toString('hex');
                    return resolve(refreshToken);
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
            return Promise.reject('API:db:login:user-auth.js:createSession - Failed to save session to the database.\n' + e);
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
                return new Promise((resolve, reject) => {
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (result) resolve(user);
                        else reject();
                    });
                });
            }
        });
    }

    // Checks if the refresh token has expired
    UserSchema.statics.isRefreshTokenExpired = (expiresAt) => {
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
        return new Promise((resolve, rejct) => {
            let expiresAt = createRefreshTokenExpiryTime();

            // Pushes the object into the sessions array
            user.sessions.push({refreshToken, expiresAt});

            // Saving to the database
            user.save().then(() => {
                return resolve(refreshToken);
            }).catch((e) => {
                rejct(e);
            });
        });
    }

    // Creates a UNIX timestamp for the expiry date of the refresh token
    let createRefreshTokenExpiryTime = () => {
        const daysUntilExpire = "10"; 
        const secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
        return ((Date.now() / 1000) + secondsUntilExpire);
    }
}