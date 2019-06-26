// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Init Variables
var app = express();

/*** Body Parser ***/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

/** Import Routes **/
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');

mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (error, res) => {
    if (error) {
        throw error;
    } else {
        console.log('Connection to mongo working');
    }
});

// Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    console.log("Server Runing in port 3000");
});