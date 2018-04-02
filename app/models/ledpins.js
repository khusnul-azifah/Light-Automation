// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var ledSchema = mongoose.Schema({
        portArduino  : String,
        ledPins     : [Number],
        sensorPin     : [Number]
});

// create the model for users and expose it to our app
var LedPins = module.exports = mongoose.model('LedPins', ledSchema);