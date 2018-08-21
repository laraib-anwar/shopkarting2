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
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var morgan = require('morgan');


var configDB 		 = require('./config/database.js');

var https 			 = require('https');

//const fs 					 = require('fs');

// configure https options for localhost
// const options 		 = {
//     key: fs.readFileSync( './server.key' ),
//     cert: fs.readFileSync( './server.crt' ),
//     requestCert: false,
//     rejectUnauthorized: false
// }

// connect to the database
mongoose.connect(configDB.url);


mongoose.connect("mongodb://laraib:laraib.anwara1@ds147461.mlab.com:47461/shopkart");
//mongoose.connect("mongodb://localhost/shopping_cart");
//require('./config/passport')(passport);


//REQUIRING ROUTES
var commentRoutes = require("./routes/comments");
var cartRoutes = require("./routes/carts");
var indexRoutes = require("./routes/index");



app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment =  require("moment");


//set up our express appication
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser()) // read cookies (needed for auth)


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
