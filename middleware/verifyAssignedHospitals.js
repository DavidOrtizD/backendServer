var medicModel = require('../models/medic');
var mongoose = require('mongoose').Types.ObjectId;

exports.verifyAssignedHospitals = function(req, res, next) {

    if (mongoose.isValid(req.body.hospitalId) && mongoose.isValid(req.params.medicId)) {
        var hospitalID = mongoose(req.body.hospitalId);
        var medicID = mongoose(req.params.medicId);
        medicModel.find({
                'hospital': hospitalID,
                '_id': medicID
            },
            (err, medicAssigned) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        errors: err
                    });
                } else {
                    if (medicAssigned.length === 0) {
                        res.status(400).json({
                            ok: false,
                            errors: { message: `Medic with id: ${req.params.medicId} is not assigned to hospital with id: ${req.body.hospitalId}` }
                        });
                    } else {
                        /* res.status(200).json({
                            ok: true,
                            medic: medicAssigned
                        }); */
                        next();
                    }
                }
            }
        );
    } else {
        if (!mongoose.isValid(req.body.hospitalId)) {
            res.status(400).json({
                ok: false,
                errors: { message: `Hospital id: ${req.body.hospitalId} is not valid.` }
            });
        } else {
            res.status(400).json({
                ok: false,
                errors: { message: `Medic id: ${req.params.medicId} is not valid.` }
            });
        }
    }
}