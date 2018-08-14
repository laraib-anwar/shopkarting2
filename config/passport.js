var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../models/user");

var configAuth = require("./config");

module.exports = function (passport) {
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebook.clientID,
            clientSecret: configAuth.facebook.clientSecret,
            profileFields: ['email', 'displayName', 'photos'],
            callbackURL: configAuth.facebook.callbackURL,


        },

//facebook will send back the token and profile
        function(token, refreshToken, profile, done) {


//asynchronous
            process.nextTick(function () {
//find the user in the database on their facebook id
                User.findOne({'facebook.id': profile.id}, function (err, user) {


//if there is any error stop everything and return  hte error connecting to the database

                    if (user) {
                        user.facebook.id = profile.id;
                        user.facebook.name = profile.displayname;
                        user.profilePic = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                        user.facebook.token.push({token: token});

                        user.save(function (err) {
                            if (err)
                                throw err;
                            // if successful then return the new user

                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));


}




