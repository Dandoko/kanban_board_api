// Routes for users

const express = require('express');
const router = express.Router();

const { User } = require('../db/models/index');

const authMiddleware = require('../middleware/auth-middleware');

// Sign up
router.post('/', (req, res) => {
    const body = req.body;
    const newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then(refreshToken => {
        // Creating the access token for the user
        return newUser.createAccessToken().then(accessToken => {
            // Access token created successfully and returning the access and refresh token as auth tokens
            return { accessToken, refreshToken };
        });
    }).then(authTokens => {
        // Creating and sending the response to the user with their auth token in the header and user in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch(e => {
        res.status(400).send(e);
    });
});

// Login
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findByCredentials(email, password).then(user => {
        return user.createSession().then(refreshToken => {
            return user.createAccessToken().then(accessToken => {
                return { accessToken, refreshToken };
            });
        }).then(authTokens => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        });
    }).catch(e => {
        // Bad request
        res.status(400).send(e);
    });
});

// Generates and returns an access token
router.get('/refresh-access-token', authMiddleware.verifySession, (req, res) => {
    // The user is authenticated and we can use user_id and user object
    req.userObject.createAccessToken().then(accessToken => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch(e => {
        response.status(400).send(e);
    });
});

module.exports = router;