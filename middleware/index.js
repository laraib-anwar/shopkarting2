var Cart = require("../models/cart");
var Comment = require("../models/comment");
var User = require("../models/user");
var Review = require("../models/review");
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
                //does user own theCart?
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


middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
       Cart.findById(req.params.id).populate("reviews").exec(function (err, foundCart) {
            if (err || !foundCart) {
                req.flash("error", "Cart not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCart.reviews
                var foundUserReview = foundCart.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};
















module.exports = middlewareObj;







