// Requires
var express = require('express');
var mongoose = require('mongoose');

// Init Variables
var app = express();

mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (error, res) => {
    if (error) {
        throw error;
    } else {
        console.log('Connection to mongo working');
    }
});

// Routes
app.get('', (req, res, next) => {
    res.status(200).json({
        ok: 'works',
        mesagge: 'Returning message'
    });
});

app.listen(3000, () => {
    console.log("Server Runing in port 3000");
});