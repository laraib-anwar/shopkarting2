var express = require("express");
var router = express.Router({mergeParams: true});
var Cart = require("../models/cart");
var Comment = require("../models/comment");
var middleware = require("../middleware");



//COMMENT ROUTES

//COMMENTS NEW
router.get("/new", function(req, res){                   // after "/", put this one-middleware.isLoggedIn,
    console.log(req.params.id);
    //find the cart with provideed id
    Cart.findById(req.params.id, function(err, cart){
        if (err) {
            console.log(err);
        }
        else {
            //render show template


            res.render("carts/show", {cart: cart});
        }
    }); 

});




//COMMENTS CREATE
router.post("/",  function(req, res){   
    //find the cart with provideed id
    Cart.findById(req.params.id, function(err, cart){
        if (err) {
            console.log(err);
            res.redirect("/carts");
        }
        else {
            console.log("====================================================")
            console.log(req.body.text);
            Comment.create({text: req.body.text}, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong!!");
                    console.log(err);
                }
                else{
                    //add username and id to the coment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    console.log(comment.author.username);

                    //save comment
                    comment.save();
                    cart.comments.push(comment);
                    cart.save();
                    console.log(comment);
                    req.flash("success", "Successfully added comment!!");
                    res.redirect('/carts/' + cart._id);
                }
            });
        }
    });

});






// //COMMENTS CREATE
// router.post("/",  async function(req, res){   
//     //find the cart with provideed id
    
//         try {
//             let cart = await Cart.findById(req.params.id);
//              //add username and id to the coment
//              comment.author.id = req.user._id;
//              comment.author.username = req.user.username;
//              console.log(comment.author.username);

         
//             let comment = await Comment.create(req.body.text);
                   
//                     //save comment
//                     comment.save();
//                     cart.comments.push(comment);
//                     cart.save();
//                     console.log(comment);
//                     req.flash("success", "Successfully added comment!!");
//                     let user = await User.findById(req.user._id).populate('followers').exec();
//                     let newNotification = {
//                     username: req.user.username,
//                     commentId: comment.id
//                     }
//                     for(const follower of user.followers) {
//                     let notification = await Notification.create(newNotification);
//                     follower.notifications.push(notification);
//                     follower.save();
//                     }
      
//                     res.redirect('/carts/' + cart._id);
//                 } catch (err) {
//                     console.log(err);
//                     res.redirect("/carts");
//                 }
//             });
        

        
    


//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //find by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/carts/" + req.params.id );
        }
    });
});

module.exports = router;