var hospitalModel = require('../models/hospital');
var mongoose = require('mongoose').Types.ObjectId;

/*** Verify that the hospital really exist ***/
exports.verifyHospital = function(req, res, next) {
    var hospitalId = req.body.hospitalId || null;
    if (mongoose.isValid(hospitalId)) {
        hospitalModel.findById(hospitalId, (err, hospitalData) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    erros: err
                });
            } else {
                if (!hospitalData) {
                    res.status(400).json({
                        ok: false,
                        errors: { message: `No hospital was found with the id: ${req.body.hospitalId}` }
                    });
                } else {
                    req.hospital = hospitalData;
                    next();
                }
            }
        });
    } else {
        res.status(400).json({
            ok: false,
            erros: { message: `Hospital id ${hospitalId} is not valid.` }
        });
    }

}