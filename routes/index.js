var express = require('express');
var router = express.Router();
var app = require('../app');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var configDB = require('../config/database.js');
var url = configDB.url;

/* ---------------------------------------------------
* Get Dashboard Page
* --------------------------------------------------- */
router.get('/dashboard', ensureAuthenticated, function(req, res, next) {
    res.render('index', { title: 'IoT Dashboard' });
});

/* ---------------------------------------------------
* Get Manage Leds Page
* --------------------------------------------------- */
router.get('/manageleds', ensureAuthenticated, function(req, res, next) {
    res.render('manageleds', { title: 'Manage Leds' });
});

/* ---------------------------------------------------
* Insert Leds
* --------------------------------------------------- */
router.post('/insertleds', function(req, res, next) {
    var LedPins = {
        portArduino: req.body.portArduino,
        ledPins: req.body.ledPins,
        sensorPin: req.body.sensorPin
    };

    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('ledpins').insertOne(LedPins, function(err, result) {
            assert.equal(null, err);
            console.log('Item inserted');
            db.close();
        });
    });
    
    res.redirect('/manageleds');
});

/* ---------------------------------------------------
* Display Leds
* --------------------------------------------------- */
router.get('/displayleds', function(req, res, next) {
    var db = req.db;
    var ledPinsList = db.collection('ledpins').find().toArray();
    db.collection('ledpins').find({}).toArray(function (err, items) {
        res.json(items);
    });
});

/* ---------------------------------------------------
* Update Leds
* --------------------------------------------------- */
router.post('/updateleds/:id', function(req, res, next) {
    var db = req.db;
    var currentId = req.params.id;
    db.collection('ledpins').updateOne({"_id": objectId(currentId)}, {$set: req.body}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/* ---------------------------------------------------
* Delete Leds
* --------------------------------------------------- */
router.delete('/deleteleds', function(req, res) {
    var db = req.db;
    var currentId = req.body.currentId || req.query.currentId;
    // var ledToDelete = req.params.id;
    db.collection('ledpins').deleteOne({"_id": objectId(currentId)}, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/* ---------------------------------------------------
* Handling Authentication
* --------------------------------------------------- */
// route middleware to make sure a user is logged in
function ensureAuthenticated(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) 
        return next();

    res.redirect('/');
}

/* ---------------------------------------------------
* Handling Error
* --------------------------------------------------- */
router.get('/e', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    res.send('ini halaman E');
});

module.exports = router;