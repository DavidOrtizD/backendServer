// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../config/config').SEED;

// Init Variables
var app = express();

var user = require('../models/user');

app.post('/', (req, res) => {
    var body = req.body;

    user.findOne({ email: body.email }, (err, dbUser) => {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Error while searching on the Data Base.',
                errors: err
            });
        } else {
            if (!dbUser) {
                res.status(400).json({
                    ok: false,
                    errors: { message: 'Wrong Credentials.' }
                });
            } else {
                if (bcrypt.compareSync(body.password, dbUser.password)) {

                    /*** Crear token ***/
                    var token = jwt.sign({ user: dbUser }, seed, { expiresIn: 14400 }); // expires in 4 hours

                    dbUser.password = '***';
                    res.status(200).json({
                        ok: true,
                        token: token,
                        user: dbUser,
                        id: dbUser._id
                    });
                } else {
                    res.status(400).json({
                        ok: false,
                        errors: { message: 'Wrong Credentials - pass.' }
                    });
                }
            }
        }
    });
});

module.exports = app;