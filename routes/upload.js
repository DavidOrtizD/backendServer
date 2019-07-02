// Requires
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

//middlewares
var auth = require('../middleware/auth');

// Init Variables
var app = express();

//default options
app.use(fileUpload());

/*** Import models ***/
const HOSPITALMODEL = require('../models/hospital');
const MEDICMODEL = require('../models/medic');
const USERMODEL = require('../models/user');

// Routes
app.put('/:collectionType/:Id', [auth.verifyToken], (req, res, next) => {

    if (!req.files) {
        return res.status(200).json({
            ok: false,
            errors: { message: `No image was sent.` }
        });
    }
    /***Get URL params ***/
    var collectionType = req.params.collectionType.toLowerCase();
    var Id = req.params.Id;

    /*** Get file name ***/
    var file = req.files.image;
    var fileArray = file.name.split('.');
    var fileExtension = fileArray[fileArray.length - 1];

    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];
    var validCollections = ['hospitals', 'medics', 'users'];

    if (validCollections.indexOf(collectionType) < 0) {
        return res.status(400).json({
            ok: false,
            errors: { message: `The Collection provided is not a valid. The valid Collections are : ${validCollections.join(',')}` }
        });
    }

    if (validExtensions.indexOf(fileExtension) < 0) {
        res.status(400).json({
            ok: false,
            errors: { message: `The image provided doesn't have the require extension. The valid extensions are : ${validExtensions.join(',')}` }
        });
    } else {
        /*** Create a new file based on the user id and the specific time the file was uploaded ***/
        var fileName = `${Id}-${new Date().getMilliseconds()}.${fileExtension}`;

        /*** Move the file to a certain path ***/
        var path = `./uploads/${collectionType}/${fileName}`;

        /*** check what collection we are going to upload ***/
        var collectionToUpdate = null;

        switch (collectionType) {
            case 'users':
                collectionToUpdate = USERMODEL;
                break;

            case 'medics':
                collectionToUpdate = MEDICMODEL;
                break;

            case 'hospitals':
                collectionToUpdate = HOSPITALMODEL;
                break;
        }
        if (collectionToUpdate) {
            uploadByType(collectionToUpdate, collectionType, Id, fileName, res, file, path);
        } else {
            res.status(400).json({
                ok: false,
                errors: { message: `The Collection provided is not a valid. The valid Collections are : ${validCollections.join(',')}` }
            });
        }

    }
});

function uploadByType(collectionToUpdate, collectionType, Id, fileName, res, file, path) {

    collectionToUpdate.findById(Id, (error, data) => {
        if (error) {
            res.status(400).json({
                ok: false,
                errors: error
            });
        } else {

            if (!data) {
                res.status(400).json({
                    ok: false,
                    errors: { message: `No data was found for the ID: ${Id} in collection ${collectionType}.` }
                });
            } else {
                var oldImage = "";
                if (data.img && data.img.trim().length > 0) {
                    oldImage = `uploads/${collectionType}/${data.img}`;
                    console.log(oldImage);
                    if (fs.existsSync(oldImage)) {

                        fs.unlink(oldImage, (err) => {
                            if (err) {
                                return res.status(400).json({
                                    ok: false,
                                    errors: `${err}`
                                });
                            }
                        });
                    }
                }
                file.mv(path, err => {
                    if (err) {
                        res.status(500).json({
                            ok: false,
                            errors: err
                        });
                    } else {
                        data.img = fileName;

                        data.save((err, saveData) => {
                            if (err) {
                                res.status(500).json({
                                    ok: false,
                                    errors: err
                                });
                            } else {
                                saveData.password = '***';
                                res.status(200).json({
                                    ok: true,
                                    message: 'Image uploaded correctly.',
                                    data: saveData
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

module.exports = app;