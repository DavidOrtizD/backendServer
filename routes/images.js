// Requires
var express = require('express');
const path = require('path');
const fs = require('fs');

// Init Variables
var app = express();

// Routes
app.get('/:collectionType/:image', (req, res, next) => {
    var collectionType = req.params.collectionType;
    var img = req.params.image;


    var imagePath = path.resolve(__dirname, `../uploads/${collectionType}/${img}`);

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        var noImagePath = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(noImagePath);
    }
});

module.exports = app;