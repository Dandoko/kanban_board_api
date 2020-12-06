const { User } = require('../db/models/index');

// Verifies the session
// Not using "app.use" because we don't want to apply it to all requests but to specific requests
let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            return Promise.reject({
                'API:middleware:verify-session-middleware': 'User not found - Make sure the refresh token and user id are valid'
            });
        }

        // User has been found and the refresh token exists in the database
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        // Checking if the refresh token is valid
        let isSessionValid = false;
        user.sessions.forEach((session) => {
            if (session.refreshToken === refreshToken) {
                // If the session has not expired
                if (User.isRefreshTokenExpired(session.expiresAt) === false) {
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            next();
        }
        else {
            return Promise.reject({
                'API:middleware:verify-session-middleware': 'Refresh token has expired or the session is invalid'
            });
        }
    }).catch((e) => {
        res.status(401).send(e);
    });
}

module.exports = verifySession;