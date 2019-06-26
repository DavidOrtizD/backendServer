// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var userModel = require('../models/user');
var auth = require('../middleware/auth');

// Init Variables
var app = express();

/*** Get all users ***/
app.get('/', function(req, res, next) {
    userModel.find({}, 'name email img role').exec(function(err, user) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mesagge: 'Server Error',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mesagge: 'Users obtained.',
            users: user
        });

    });
});

/*** Create  new User ***/
app.post('/', auth.verifyToken, (req, res) => {
    var body = req.body;
    var newUser = new userModel({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
    });
    if (body.role) {
        newUser['role'] = body.role.toUpperCase();
    }

    newUser.save((error, savedData) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mesagge: 'Error Creating new record on db',
                errors: error
            });
        }

        savedData.password = '***';
        res.status(201).json({
            ok: true,
            reqUser: req.currentUser,
            user: savedData
        });
    });
});

/*** Update User ***/
app.put('/:id', auth.verifyToken, (req, res) => {
    var userId = req.params.id;
    userModel.findById(userId, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error searching user.',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: `User with id: ${userId} was not found.`,
                errors: { message: `User with id: ${userId} was not found.` }
            });
        } else {

            var body = req.body;

            user.name = body.name;
            user.email = body.email;
            user.role = body.role.toUpperCase();

            user.save((err, savedUser) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: `Error updating ${userId}.`,
                        errors: err
                    });
                } else {
                    savedUser.password = '***';
                    res.status(200).json({
                        ok: true,
                        message: `User with id: ${userId} updated Correctly.`,
                        user: savedUser
                    });
                }
            });
        }
    });
});

/*** Delete User ***/
app.delete('/:id', auth.verifyToken, (req, res) => {
    var id = req.params.id;
    userModel.findByIdAndRemove(id, (err, response) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting the user.',
                errors: err
            });
        } else {
            if (response) {
                response.password = '***';
                res.status(200).json({
                    ok: true,
                    message: `User ${id} deleted correctly.`,
                    user: response
                });
            } else {
                res.status(400).json({
                    ok: false,
                    errors: { message: `There is no user with id: ${id}.` },
                });
            }
        }
    });
});

module.exports = app;