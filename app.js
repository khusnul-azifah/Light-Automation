//Init app
var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var index = require('./routes/index');
var users = require('./routes/users');
var consolePrefix = 'Light Automation: ';
var requestPrefix = '/app';
var five = require("johnny-five");
var board = new five.Board();
var photocell;
var latestLightLevel = null;
var mongoose = require('mongoose');

// New Database lines
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/ledautomation", {native_parser:true});
var configDB = require('./config/database.js');

var passport = require('passport');
var flash = require('req-flash');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logout = require('express-passport-logout');

var MongoStore = require('connect-mongostore')(session);

var leds;
var pinList;
var pins;
var sensorPin;

app.io = require('socket.io')();

// configuration
mongoose.connect(configDB.url); // connect to our database
// Make our db accessible to our router
app.use(function(req, res, next){
    req.db = db;
    next();
}); 

require('./config/passport')(passport); // pass passport for config

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------------------------------------------
 *  BodyParser Middleware
 * --------------------------------------------------- */
// Parse application/json requests
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
    secret: 'anything',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

/* ---------------------------------------------------
 *  Passport
 * --------------------------------------------------- */
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routes
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.use('/', index);
// app.use('/users', users);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// caching disabled for every route
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

/* ---------------------------------------------------
 *  Johnny Five
 * --------------------------------------------------- */
db.collection('ledpins').find({}, {'portArduino': true}).toArray(function(err, results) {
    portNumber = results[0].portArduino;
    console.log(portNumber);
});

db.collection('ledpins').find({}, {'ledPins': true}).toArray(function(err, results) {
    pinList = results[0].ledPins;
    pins = JSON.parse("[" + pinList + "]");
    console.log(pins);
});

db.collection('ledpins').find({}, {'sensorPin': true}).toArray(function(err, results) {
    sensorPin = results[0].sensorPin;
    console.log(sensorPin);
});

var brightnessValue = 255;

board.on("ready", function() {
    console.log("Board is ready");
    photocell = new five.Sensor({
        pin: sensorPin,
        freq: 3000
    });
    // portNumber: "COM6";
    leds = new five.Leds(pins);

    app.io.on("connection", function(socket) {
        photocell.on("change", function(err, value) {
            // Brightness will be from 0 - 255
            var value = photocell.value;
            var brightnessValue = five.Fn.map(value, 0, 1023, 0, 255);
            console.log(brightnessValue);
            // element.brightness(255 - ledBrightness); //inverse light intensity
            latestLightLevel = brightnessValue;
            socket.emit('roomLightLevelReturned', brightnessValue);
            socket.emit('roomLightReturned', brightnessValue);
        });
    });
});

/* ---------------------------------------------------
 *  Socket IO
 * --------------------------------------------------- */
app.io.on("connection", function(socket) {
    console.log("Koneksi socket aktif");
    socket.emit('news', { hello: 'world' });
    socket.emit('callRoomLeds', { pinList });
    socket.on('switchAllOn', function(data) {
        console.log(data);
        if (board.isReady) {
            leds.on();
            socket.emit('ledStatus', { status: 'All on' });
        };
    });
    socket.on('switchAllOff', function(data) {
        console.log(data);
        if (board.isReady) {
            leds.off();
            socket.emit('ledStatus', { status: 'All off' });
        };
    });
    socket.on('switchOneOn', function(data) {
        console.log(data);
        thisIndex = data.index;
        if (board.isReady) {
            leds[thisIndex].on();
            socket.emit('ledStatus', { status: board.pins[thisIndex].value });
        };
    });
    socket.on('switchOneOff', function(data) {
        console.log(data);
        thisIndex = data.index;
        if (board.isReady) {
            leds[thisIndex].off();
            socket.emit('ledStatus', { status: board.pins[thisIndex].value });
        };
    });
});

module.exports = app;