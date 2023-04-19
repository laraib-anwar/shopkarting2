var express = require("express");
var dotenv = require("dotenv");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Cart = require("./models/cart");
var Comment = require("./models/comment");
var Review = require("./models/review");

var User = require("./models/user");
var cookieParser = require("cookie-parser");
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var morgan = require('morgan');
MongoClient = require('mongodb').MongoClient;
var expressValidator = require("express-validator");

var configDB 		 = require('./config/database.js');

var https 			 = require('https');

//========================
var http = require('http');
var socketIO = require('socket.io');
var server = http.createServer(app);
const port = process.env.PORT || 3000;
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
var io = socketIO(server);
var users = new Users();
const path = require('path');
const publicPath = path.join(__dirname, '../public');


dotenv.config();
  



mongoose.set('debug', true);

// connect to the database
// mongoose.connect(configDB.url);
// mongoose.Promise = Promise;

//MongoClient.connect("mongodb://localhost:27017/shopping_cart", { useNewUrlParser: true });




mongoose.connect(
  "mongodb+srv://laraib:iloveislam@campustalk.0t1ub.mongodb.net/shopkart?retryWrites=true&w=majority"
);
//mongoose.connect("mongodb://localhost/shopping_cart");
require('./config/passport')(passport);


//REQUIRING ROUTES
var commentRoutes = require("./routes/comments");
var cartRoutes = require("./routes/carts");
var indexRoutes = require("./routes/index");
var reviewRoutes     = require("./routes/reviews");


app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



//Exress Validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.');
            root = namespace.shift();
            formParam = root;

        while(namespace.length) {
            formatter +=  '[' + namespace.shift() + ']';

        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));





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





app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    if(req.user) {
     try {
       let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
       res.locals.notifications = user.notifications.reverse();
     } catch(err) {
       console.log(err.message);
     }
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
 });



// app.use(function(req, res, next){
//     res.locals.currentUser = req.user;
//     res.locals.error = req.flash("error");
//     res.locals.success = req.flash("success");
//     next();
// });




app.use("/carts/:id/comments", commentRoutes);
app.use("/carts", cartRoutes);
app.use("/", indexRoutes);
app.use("/carts/:id/reviews", reviewRoutes);




//============================================
//app.use(express.staticProvider(__dirname + '/public'));
io.on('connection', (socket) => {
    console.log('New user connected');
  
    socket.on('join', (params, callback) => {
      if (!isRealString(params.name) || !isRealString(params.room)) {
        return callback('Name and room name are required.');
      }
  
      socket.join(params.room);
      users.removeUser(socket.id);
      users.addUser(socket.id, params.name, params.room);
  
      io.to(params.room).emit('updateUserList', users.getUserList(params.room));
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
      callback();
    });
  
    socket.on('createMessage', (message, callback) => {
      var user = users.getUser(socket.id);
  
      if (user && isRealString(message.text)) {
        io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
      }
  
      callback();
    });
  
    socket.on('createLocationMessage', (coords) => {
      var user = users.getUser(socket.id);
  
      if (user) {
        io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
      }
    });
  
    socket.on('disconnect', () => {
      var user = users.removeUser(socket.id);
  
      if (user) {
        io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
      }
    });

    socket.on('typing', function(data){
      socket.broadcast.emit('typing', data);
    });







  });





server.listen(port,function(){
    console.log("Ready to go");
});
