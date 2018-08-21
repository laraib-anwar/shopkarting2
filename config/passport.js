var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var User = require("../models/user");

var configAuth = require("./auth");

module.exports = function (passport) {



    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================




    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,

            callbackURL: configAuth.facebookAuth.callbackURL,


        },

//facebook will send back the token and profile
        function(accesstoken, refreshToken, profile, done) {
            console.log("Auth done");

//asynchronous
            process.nextTick(function () {
//find the user in the database on their facebook id
                User.findOne({'facebook.id': profile.id}, function (err, user) {


//if there is any error stop everything and return  hte error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = accesstoken; // we will save the token that facebook provides to the user

                        //newUser.facebook.name  = profile.displayName,
                        newUser.facebook.name  = profile.name.givenName + '' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email  = profile.emails[0].value;
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        })
                    }
                })
            })
        }))









    passport.use(new GoogleStrategy({

            // pull in our app id and secret from our auth.js file
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,

            callbackURL: configAuth.googleAuth.callbackURL,


        },

//google will send back the token and profile
        function(accesstoken, refreshToken, profile, done) {


//asynchronous
            process.nextTick(function () {
//find the user in the database on their google id
                User.findOne({'google.id': profile.id}, function (err, user) {


//if there is any error stop everything and return  hte error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that google id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.google.id    = profile.id; // set the users facebook id
                        newUser.google.token = accesstoken; // we will save the token that facebook provides to the user
                        newUser.google.name  =  profile.displayName; // look at the passport user profile to see how names are returned
                        newUser.google.email  = profile.emails[0].value;
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        })
                        console.log(profile);
                    }
                })
            })
        }))
}




