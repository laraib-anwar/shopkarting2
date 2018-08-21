var Cart = require("../models/cart");
var Comment = require("../models/comment");
var User = require("../models/user");

//all the midlleware goes here
var middlewareObj = {};

middlewareObj.checkCartOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Cart.findById(req.params.id, function(err, foundCart){
            if(err || !foundCart){
                req.flash("error", "Cart not found");
                res.redirect("back");
            }
            else{
                //does user own the campground?
                if(foundCart.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("error", "You dont have permission to do that!!");
                    res.redirect("back");
                }


            }
        });
    }
    else{
        req.flash("error", "You need to be logged in to do that!!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){

    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");

                res.redirect("back");
            }
            else{

                //does user own the comment?
                if(foundComment.author.id.equals(req.user._id)){

                    next();
                }
                else{
                    req.flash("error", "You dont have permission to do that!!");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that!!");

        res.redirect("back");
    }
};


middlewareObj.isLoggedIn = function(req, res, next) {
    var active;
    if (req.isAuthenticated()) {
        function verify() {
            User.findOne({email: req.user.email}, function (err, user) {
                //console.log("1      ", user);
                active = user.active;
                if (active == true) {
                    return next();
                }
                req.flash("error", "You need to verify your email to see the content!!");
                res.redirect("/carts");
            });
        }

        return verify();
    } else {
        req.flash("error", "You need to be logged in to do that!!");

        res.redirect("/login");
    }
};



//middleware for fb
// module.exports = {
//     // route middleware to make sure a user is logged in
//     isLoggedIn: (req, res, next) => {
//
//         // if user is authenticated in the session, carry on
//         if (req.isAuthenticated())
//             return next()
//
//         // if they aren't redirect them to the home page
//         res.redirect('/')
//     }
// }
//
//

















module.exports = middlewareObj;







