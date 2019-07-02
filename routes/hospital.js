var express = require('express');
var hospitalModel = require('../models/hospital');
var userModel = require('../models/user');
var auth = require('../middleware/auth');

var app = express();

/*** Get all hospitals  ***/
app.get('/', (req, res) => {
    var from = Number(req.query.from) || 0;
    var limit = Number(req.query.limit) || 5;

    if (isNaN(from)) {
        return res.status(400).json({
            ok: false,
            errors: { message: `${from} is not a valid value for "from" parameter.` }
        });
    }

    if (isNaN(limit)) {
        return res.status(400).json({
            ok: false,
            errors: { message: `${limit} is not a valid value for "limit" parameter.` }
        });
    }

    hospitalModel.find({})
        .skip(from)
        .limit(limit)
        .populate('user', 'name email')
        .exec((err, data) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    error: err
                });
            } else {
                hospitalModel.count({}, (err, counter) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            error: err
                        });
                    } else {
                        res.status(200).json({
                            ok: false,
                            message: 'Hospitals found.',
                            hospitals: data,
                            total: counter
                        });
                    }
                });
            }
        });

});

/*** Add a new hospital ***/
app.post('/', auth.verifyToken, (req, res) => {
    userModel.findById(req.currentUser._id, (err, userData) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            if (!userData) {
                res.status(400).json({
                    ok: false,
                    errors: { message: `No user was found with that id: ${req.currentUser._id}` }
                });
            } else {
                var newHospital = new hospitalModel({
                    name: req.body.name,
                    img: req.body.img,
                    user: req.currentUser._id
                });

                newHospital.save((err, data) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            errors: err
                        });
                    } else {
                        res.status(201).json({
                            ok: true,
                            message: 'Hospital saved correctly.',
                            hospital: data,
                            reqUser: req.currentUser
                        });
                    }
                });
            }
        }
    });
});

app.put('/:hospitalId', auth.verifyToken, (req, res) => {
    hospitalModel.findById(req.params.hospitalId, (err, hospitalData) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            if (hospitalData) {
                hospitalData.name = req.body.name || null;
                hospitalData.img = req.body.img;

                hospitalData.save((err, dataSaved) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            errors: err
                        });
                    } else {
                        res.status(200).json({
                            ok: true,
                            message: 'Hospital information updated correctly.',
                            hospital: dataSaved,
                            reqUser: req.currentUser
                        });
                    }
                });
            } else {
                res.status(400).json({
                    ok: false,
                    errors: { message: `No hospital was found with the id: ${req.params.hospitalId}` }
                });
            }

        }
    });
});

app.delete('/:hospitalId', auth.verifyToken, (req, res) => {
    var hospitalId = req.params.hospitalId;
    hospitalModel.findByIdAndRemove(hospitalId, (err, hospitalData) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            if (hospitalData) {
                res.status(200).json({
                    ok: true,
                    message: `Hospital ${hospitalId} deleted correctly.`,
                    hospital: hospitalData,
                    reqUser: req.currentUser
                });
            } else {
                res.status(400).json({
                    ok: false,
                    errors: { message: `Hospital with id:${hospitalId} was not found on the data base.` }
                });
            }
        }
    });
});

module.exports = app;