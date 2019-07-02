var express = require('express');
var medicModel = require('../models/medic');
var hospitalModel = require('../models/hospital');
var userModel = require('../models/user');

var app = express();

/*** Search given a certain collection ***/
app.get('/collection/:collectionName/:searchParam', (req, res) => {
    searchParams = new RegExp(req.params.searchParam, 'i');
    collectionName = req.params.collectionName.toLowerCase();

    switch (collectionName) {
        case 'user':
            findUsers(searchParams)
                .then((response) => {
                    return res.status(200).json({
                        ok: true,
                        collectionName: response
                    });
                })
                .catch((error) => {
                    return res.status(400).json({
                        ok: true,
                        errors: error
                    });
                });
            break;
        case 'medic':
            findMedics(searchParams)
                .then((response) => {
                    return res.status(200).json({
                        ok: true,
                        collectionName: response
                    });
                })
                .catch((error) => {
                    return res.status(400).json({
                        ok: true,
                        errors: error
                    });
                });
            break;
        case 'hospital':
            findHospitals(searchParams)
                .then((response) => {
                    return res.status(200).json({
                        ok: true,
                        collectionName: response
                    });
                })
                .catch((error) => {
                    return res.status(400).json({
                        ok: true,
                        errors: error
                    });
                });
            break;
        default:
            return res.status(400).json({
                ok: false,
                errors: { message: `Collection ${collectionName} is not valid.` }
            });

    }
});


/*** Search between all collections ***/
app.get('/all/:searchParam', (req, res) => {
    searchParams = new RegExp(req.params.searchParam, 'i');

    Promise.all([
            findHospitals(searchParams),
            findMedics(searchParams),
            findUsers(searchParams)
        ])
        .then((response) => {
            return res.status(200).json({
                ok: true,
                hospital: response[0],
                medics: response[1],
                users: response[2]

            });
        }).catch((error) => {
            return res.status(400).json({
                ok: true,
                errors: error
            });
        });
});

function findHospitals(params) {
    return new Promise((resolve, reject) => {
        hospitalModel.find({ 'name': params })
            .populate('user', 'name email')
            .exec((err, hospitalData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hospitalData);
                }
            });
    });
}

function findMedics(params) {
    return new Promise((resolve, reject) => {
        medicModel.find({ 'name': params })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, doctorsData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(doctorsData);
                }
            });
    });
}

function findUsers(params) {
    return new Promise((resolve, reject) => {
        userModel.find({}, 'name email role')
            .or([{ 'name': params }, { 'email': params }])
            .exec((err, doctorsData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(doctorsData);
                }
            });
    });
}

module.exports = app;