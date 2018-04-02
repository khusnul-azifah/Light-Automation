module.exports = function(app, passport) {

    /* ---------------------------------------------------
    * Login
    * --------------------------------------------------- */
     // show the login form
    app.get('/', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.jade', { message: req.flash('loginMessage') }); 
    });

    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.jade', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // console.log(isAuthenticated);

    /* ---------------------------------------------------
    * Signup
    * --------------------------------------------------- */
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.jade', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    /* ---------------------------------------------------
    * Logout
    * --------------------------------------------------- */
    app.get('/logout', function(req, res){
        console.log('logging out');
        req.logout();
        res.redirect('/');
    });

    /* ---------------------------------------------------
    * Home Section
    * --------------------------------------------------- */
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/dashboard', ensureAuthenticated, function(req, res) {
        res.render('index.jade', {
            user : req.user // get the user out of session and pass to template
        });
    });

    /* ---------------------------------------------------
    * Logout
    * --------------------------------------------------- */
    app.get('/logout', function(req, res) {
        req.logOut();
        req.session.destroy();
        res.redirect('/');
    });

    /* ---------------------------------------------------
    * Google Routes
    * --------------------------------------------------- */
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    /* ---------------------------------------------------
    * Authorize (Already Logged In / Connecting other Social Account)
    * --------------------------------------------------- */
    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    /* ---------------------------------------------------
    * Unlink Accounts
    * --------------------------------------------------- */
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
           res.redirect('/profile');
        });
    });
    
};

// route middleware to make sure a user is logged in
function ensureAuthenticated(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) 
        return next();

    res.redirect('/');
}