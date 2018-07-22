var Cart = require("../models/cart");
var Comment = require("../models/comment");

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
}

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
}




middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!!");
    res.redirect("/login");
}


module.exports = middlewareObj;