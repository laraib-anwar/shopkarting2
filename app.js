var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Cart = require("./models/cart");
var Comment = require("./models/comment");
var User = require("./models/user");
var cookieParser = require("cookie-parser");
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var secret = require("./helpers/secret");



//REQUIRING ROUTES
var commentRoutes = require("./routes/comments");
var cartRoutes = require("./routes/carts");
var indexRoutes = require("./routes/index");



mongoose.connect("mongodb://laraib:laraib.anwara1@ds147461.mlab.com:47461/shopkart");
// mongoose.connect("mongodb://localhost/shopping_cart");
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment =  require("moment");




//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins the cutest dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






passport.use(new facebookStrategy({
        clientID: secret.facebook.clientID,
        clientSecret: secret.facebook.clientSecret,
        profileFields: ['email', 'displayName', 'photos'],
        callbackURL: 'https://localhost:3000/auth/facebook/callback',
        passRegToCallback: true

    },
    function(req, token, refreshToken, profile, done) {
        User.findOne({email: profile._json.email}, function (err, user) {
            if (err)
                return done(err);
            if (user) {
                user.facebook = profile.id;
                user.fullname = accessToken;
                user.profilePic = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                user.fbTokens.push({token: token});

                user.save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newUser);

                });
            }

            else
            {
                var newUser = new User();
                newUser.facebook = profile.id;
                newUser.username = profile.displayName;
                newUser.email = profile._json.email;
                newUser.profilePic = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                newUser.fbTokens.push({token: token});
                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, user);

                });
            }

        })
    }));









passport.use(new googleStrategy({
        clientID: secret.google.clientID,
        clientSecret: secret.google.clientSecret,
        callbackURL: 'http://localhost:3000/auth/google/callback',
        passRegToCallback: true

    },
    function(req, token, refreshToken, profile, done) {
        User.findOne({email: profile.emails[0].value}, function (err, user) {
            if (err)
                return done(err);
            if (user) {
                user.google = profile.id;
                user.fullname = accessToken;
                user.profilePic = profile._json.image.url;


                user.save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newUser);

                });
            }

            else
            {
                var newUser = new User();
                newUser.google = profile.id;
                newUser.username = profile.displayName;
                newUser.email = profile.emails[0].value;
                newUser.profilePic = profile._json.image.url;


                newUser.save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, user);

                });
            }

        })
    }));




app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/carts/:id/comments", commentRoutes);
app.use("/carts", cartRoutes);
app.use("/", indexRoutes);
















app.listen(process.env.PORT || 3000,function(){
    console.log("Ready to go");
});
