var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

/*** Token veryfication ***/
exports.verifyToken = function(req, res, next) {
    var token = req.body.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mesagge: 'User not authorized.',
                errors: err
            });
        }

        /* res.status(200).json({
            ok: true,
            decoded: decoded
        }); */
        decoded.usuario.password = '***';
        req.currentUser = decoded.usuario;
        next();
    });
}