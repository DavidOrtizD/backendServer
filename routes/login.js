// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

// Init Variables
var app = express();

var user = require('../models/user');

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}

/*** Google Authentication ***/
app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((error) => {
            return res.status(403).json({
                ok: false,
                errors: 'Invalid Token.'
            });
        });
    if (googleUser.name) {
        user.findOne({ email: googleUser.email }, (err, dbUser) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    message: 'Error while searching on the Data Base.',
                    errors: err
                });
            } else {
                if (dbUser) {
                    if (dbUser.google === false) {
                        res.status(400).json({
                            ok: false,
                            errors: { message: 'Please use the normal login.' }
                        });
                    } else {
                        /*** Crear token ***/
                        var token = jwt.sign({ user: dbUser }, seed, { expiresIn: 14400 }); // expires in 4 hours

                        dbUser.password = '***';
                        res.status(200).json({
                            ok: true,
                            token: token,
                            user: dbUser,
                            id: dbUser._id
                        });
                    }
                } else {
                    /*** Creating a new user ***/
                    var newUser = new user();

                    newUser.name = googleUser.name;
                    newUser.email = googleUser.email;
                    newUser.img = googleUser.picture;
                    newUser.googleAuth = true;
                    newUser.password = '***';

                    newUser.save((error, savedUser) => {
                        if (error) {
                            res.status(500).json({
                                ok: false,
                                error
                            });
                        } else {
                            /*** Crear token ***/
                            var token = jwt.sign({ user: dbUser }, seed, { expiresIn: 14400 }); // expires in 4 hours

                            savedUser.password = '***';

                            res.status(200).json({
                                ok: true,
                                token: token,
                                user: savedUser,
                                id: googleUser._id
                            });
                        }
                    });
                }
            }
        });
    }
});

/*** Normal Authentication ***/
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