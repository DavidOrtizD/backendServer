// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

/** Import Routes **/
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicRoutes = require('./routes/medic');
var allsearchRoutes = require('./routes/allsearch');
var uploadRoutes = require('./routes/upload');
var imageRoutes = require('./routes/images');

// Init Variables
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

/*** Body Parser ***/
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (error, res) => {
    if (error) {
        throw error;
    } else {
        console.log('Connection to mongo working');
    }
});

// Routes
app.use('/user', userRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medic', medicRoutes);
app.use('/login', loginRoutes);
app.use('/search', allsearchRoutes);
app.use('/upload', uploadRoutes);
app.use('/images', imageRoutes);

app.listen(3000, () => {
    console.log("Server Runing in port 3000");
});