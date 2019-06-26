// Requires
var express = require('express');

// Init Variables
var app = express();

// Routes
app.get('', (req, res, next) => {
    res.status(200).json({
        ok: 'works',
        mesagge: 'Returning message'
    });
});

module.exports = app;