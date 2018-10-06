var FacebookStrategy = require('passport-facebook').Strategy;
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Cart = require("../models/cart");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
var Notification = require("../models/notification");
var { isLoggedIn } = require('../middleware');
sgMail.setApiKey('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');



//ROOT ROUTE
router.get("/",function(req,res){
    res.render("home", {currentUser: req.user});
});

//Auth routes
//Show sign up form
//SHOW REGISTER FORM
router.get("/register", function(req, res){
    res.render("register");
});


//handling user sign up
router.post("/register", function(req, res){
    req.checkBody('email', 'Invalid email. Please ensure your email is correct!').isEmail();
    req.checkBody('password', 'Invalid Password must be atleast four characters!').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(err) {
            messages.push(err.msg);
            req.flash("error", err.msg);
            res.redirect("/register");
        });
    }
    token = crypto.randomBytes(20).toString('hex');
    var newUser = new User(
        {
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.avatar,
            verifyToken: token,
            active: false
        });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }





//SENDING EMAIL VIA SENDGRID
        const msg = {
                 to: user.email,
                 from: 'verify@shopkarting.in',
                 subject: 'Shopkarting email verification',
                 text: 'Please click on the following link, or paste this into your browser to verify your email address:\n\n' +
                 'http://' + req.headers.host + '/verify/' + token + '\n\n' +
                 'If you did not request this, please ignore this email.\n'
             };



        sgMail.send(msg, function (err) {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions for verification of your gmail id.');
            res.redirect("/carts");
        });




    });

});




router.get("/help", function(req, res){
    res.render("help");
});





//LOGIN ROUTES
//render login form

router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});

//handling login logic    //middleware
router.post("/login",passport.authenticate("local",
    {
        successRedirect: "/carts",
        failureRedirect: "/login"
    }), function(req, res){
});









//Auth for facebook you tube method

// route for showing the profile page
router.get('/profile', isLoggedIn, function(req, res){
    res.render('profile', {user: req.user});
});

// route for facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));


// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/carts',
    failureRedirect: '/'
}));










//Auth for google you tube methid

router.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']}));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: "/carts",
    failureRedirect: "/"

}));





//logout route

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/carts");
});

//middleware for facebook


    // route middleware to make sure a user is logged in
     function isLoggedIn(req, res, next){

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

// if they aren't redirect them to the home page
        res.redirect('/');

}



// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
});


router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Sendgrid', //'Gmail',
                auth: {
                    // user: 'laraib.anwar919@gmail.com',
                    // pass: 'laraibforislam'

                     user: 'shopkart',
                    pass: 'laraib@123'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'verify@shopkarting.in',
                subject: 'Password Reset for shopkarting',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Sendgrid', //'Gmail',
                auth: {
                     //user: 'laraib.anwar919@gmail.com',
                     //pass: 'laraibforislam'
                   user: 'shopkart',
                    pass: 'laraib@123'

                }
            });
            var mailOptions = {
                to: user.email,
                from: 'verify@shopkarting.in',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/carts');
    });
});


//Gmail verification
router.get('/verify/:token', function(req, res) {
    async.waterfall([
        function (done) {
            User.findOne({verifyToken: req.params.token}, function (err, user) {
                if (!user) {
                    req.flash('error', 'Token is invalid.');
                    return res.redirect('back');
                }
                user.verifyToken = undefined;
                user.active = true;

                user.save(function (err) {
                    done(err, user);
                });


            });
        },



// VERIFYING GMAIL USING SENDGRID

        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Sendgrid', //'Gmail',
                auth: {
                    //user: 'laraib.anwar919@gmail.com',
                    //pass: 'laraibforislam'


                    user: 'shopkart',
                    pass: 'laraib@123'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'verify@shopkarting.in',
                subject: 'Email address verified',
                text: 'Hello,\n\n' +
                'This is a confirmation that your email ' + user.email + ' has just been verified.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if(err) {
                    done(err);
                }
                req.flash('success', 'Email address has been verified.');
                res.redirect("/carts");

            });
        }
    ], function(err) {
        res.redirect('/carts');
    });
});


//chat route

router.get("/chat", isLoggedIn, function(req, res){
    res.render("index"); 
 });







 function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be signed in to do that!');
    res.redirect('/login');
}








//USER PROFILE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id).populate('followers').exec(function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("/");
        }
        Cart.find().where("author.id").equals(foundUser._id).exec(function(err, carts){
            if(err){
                req.flash("error", "Something went wrong");
                res.redirect("/");
            }
            res.render("users/show", {user: foundUser, carts: carts});
        });

    });
});




// // user profile
// router.get('/users/notify/:id', async function(req, res) {
//     try {
//       let user = await User.findById(req.params.id).populate('followers').exec();
//       res.render('profile', { user });
//     } catch(err) {
//       req.flash('error', err.message);
//       return res.redirect('back');
//     }
//   });




// follow user
// router.get('/follow/:id', isLoggedIn, async function(req, res) {
//     try {
//       let user = await User.findById(req.params.id);
//       user.followers.push(req.user._id);
//       user.save();
//       req.flash('success', 'Successfully bookmarked for notification ' + user.username + '!');
//       res.redirect('/users/notify/' + req.params.id);
//     } catch(err) {
//       req.flash('error', err.message);
//       res.redirect('back');
//     }
//   });
  
  
  // follow user
  router.get('/follow/:id', isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.params.id);
      user.followers.push(req.user._id);
      user.save();
      req.flash('success', 'Successfully bookmarked for notifications from' + user.username + '!');
      res.redirect('/users/' + req.params.id);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // view all notifications
  router.get('/notifications', isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.user._id).populate({
        path: 'notifications',
        options: { sort: { "_id": -1 } }
      }).exec();
      let allNotifications = user.notifications;
      res.render('notifications/index', { allNotifications });
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // handle notification
  router.get('/notifications/:id', isLoggedIn, async function(req, res) {
    try {
      let notification = await Notification.findById(req.params.id);
      notification.isRead = true;
      notification.save();
      res.redirect(`/carts/${notification.cartId}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');                     
    }
  });


  // handle notification
//   router.get('/notifications/:id', isLoggedIn, async function(req, res) {
//     try {
//       let notification = await Notification.findById(req.params.id);
//       notification.isRead = true;
//       notification.save();
//       res.redirect(`/carts/${notification.commentId}`);
//     } catch(err) {
//       req.flash('error', err.message);
//       res.redirect('back');                     
//     }
//   });
  
  
  

module.exports = router;

