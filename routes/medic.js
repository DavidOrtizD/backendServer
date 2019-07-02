var express = require('express');
var medicModel = require('../models/medic');

/*** Middlewares ***/
var checkHospital = require('../middleware/verifyHospital');
var checkLogin = require('../middleware/auth');
var ismedicAssignedToHospital = require('../middleware/verifyAssignedHospitals');

app = express();

/*** Get medics ***/
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
    medicModel.find({})
        .skip(from)
        .limit(limit)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((error, medicData) => {
            if (error) {
                res.status(500).json({
                    ok: false,
                    errors: error
                });
            } else {
                medicModel.count({}, (err, counter) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            errors: error
                        });
                    } else {
                        res.status(200).json({
                            ok: true,
                            message: 'Medics requested correctly.',
                            medic: medicData,
                            total: counter
                        });
                    }
                });
            }
        });
});

/*** Create Medics ***/
app.post('/', [checkHospital.verifyHospital, checkLogin.verifyToken], (req, res) => {

    var newMedic = new medicModel({
        name: req.body.name,
        img: req.body.img || null,
        user: req.currentUser._id,
        hospital: req.hospital._id
    });

    newMedic.save((err, savedMedic) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                message: 'Medic created correctly.',
                medic: savedMedic,
                hospital: req.hospital,
                user: req.currentUser
            });
        }
    });
});

/*** Update Medic Info ***/
app.put('/:medicId', [checkHospital.verifyHospital, checkLogin.verifyToken, ismedicAssignedToHospital.verifyAssignedHospitals], (req, res) => {

    medicModel.findById(req.params.medicId, (err, medicData) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            if (!medicData) {
                res.status(400).json({
                    ok: false,
                    errors: { message: `No medic was found with the id: ${req.params.medicId}` }
                });
            } else {

                medicData.name = req.body.name;
                if (req.body.img) {
                    medicData.img = req.body.img;
                } else {
                    medicData.img = medicData.img;
                }
                medicData.save((err, savedMedic) => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            errors: err
                        });
                    } else {
                        res.status(200).json({
                            ok: true,
                            message: `Medic updated correctly.`,
                            medic: savedMedic,
                            hospital: req.hospital,
                            reqUser: req.currentUser
                        });
                    }
                });

            }
        }
    });
});

app.delete('/:medicId', [checkHospital.verifyHospital, checkLogin.verifyToken, ismedicAssignedToHospital.verifyAssignedHospitals], (req, res) => {
    medicModel.findByIdAndRemove(req.params.medicId, (err, deletedMedic) => {
        if (err) {
            res.status(500).json({
                ok: false,
                errors: err
            });
        } else {
            res.status(200).json({
                ok: true,
                message: `Medic deleted correctly.`,
                reqUser: req.currentUser,
                hospital: req.hospital,
                medic: deletedMedic
            });
        }
    });
});

module.exports = app;