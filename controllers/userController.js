const User 		 = require('../models/user')
const passport = require('passport')
require('../config/passport')(passport)

exports.index = function(req, res, next){
    res.render('register') // load the index.ejs file
};

exports.profileGet = function(req, res, next){
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    })
}

exports.authFacebookGet = passport.authenticate('facebook', { scope: 'public_profile' })

exports.authFacebookCallbackGet =
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/register'
    })

exports.logoutGet = function(req, res, next){
    req.logout()
    res.redirect('/')
}