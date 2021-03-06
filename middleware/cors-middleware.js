// Resolving CORS headers
const cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-refresh-token, _id');
    
    // Giving explicit permission to read the headers
    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');

    // @see https://stackoverflow.com/questions/32500073/request-header-field-access-control-allow-headers-is-not-allowed-by-itself-in-pr
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    };

    next();
};

module.exports = cors;