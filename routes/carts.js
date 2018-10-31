var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Cart = require("../models/cart");
var middleware = require("../middleware");
var request = require("request");
var multer = require('multer');
var Notification = require("../models/notification");
var Review = require("../models/review");
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dr9yqriaj',
    api_key: "864994674368474",
    api_secret: "4GMo98OrAC7WsQ7Eu5ghPAv0q3w"
});



//INDEX - SHOW ALL CARTS
router.get("/",function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search),"gi");
        //Get all carts from db
        Cart.find({name: regex}, function (err, allCarts) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(allCarts);
                res.render("carts/index", {carts: allCarts});
            }
        });
    }
    else {

        //Get all carts from db
        Cart.find({}, function (err, allCarts) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(allCarts);
                res.render("carts/index", {carts: allCarts});
            }
        });
    }

});




//CREATE - ADD NEW CART TO DB
router.post("/", middleware.isLoggedIn, upload.single('image'), async function(req, res) {
    cloudinary.uploader.upload(req.file.path, async function(result) {
        // add cloudinary url for the image to the cart object under image property
        req.body.cart.image = result.secure_url;
        // add author to cart
        req.body.cart.author = {
            id: req.user._id,
            username: req.user.username
        };
        
        
        try {
            let cart = await Cart.create(req.body.cart);
            let user = await User.findById(req.user._id).populate('followers').exec();
            let newNotification = {
              username: req.user.username,
              cartId: cart.id
            }
            for(const follower of user.followers) {
              let notification = await Notification.create(newNotification);
              follower.notifications.push(notification);
              follower.save();
            }
      
            //redirect back to carts page
            req.flash('success', 'Successfully uploaded. Scroll below to see your post.');
            res.redirect(`/carts/${cart.id}`);
          } catch(err) {
            req.flash('error', err.message);
            res.redirect('back');
          }

    });
});


//NEW SHOW FORM TO CREATE A CART
router.get("/new", middleware.isLoggedIn, function (req,res){
    res.render("carts/new");
});


//SHOW CART  -shows more info about one CART

router.get("/:id", function(req,res) {
    //find the cart with unique id
    Cart.findById(req.params.id).populate("comments")
    .populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    })
    .exec(function(err, foundCart){
        if(err || !foundCart)
        {
            req.flash("error", "Cart not found");
            res.redirect("back");
        }
        else{
            console.log("Cart:\n",foundCart);
            //render show template with that cart
            res.render("carts/show",{cart: foundCart});
        }
    });

 });



//EDIT CART
router.get("/:id/edit", middleware.checkCartOwnership, function(req, res) {


        Cart.findById(req.params.id, function (err, foundCart) {
            if(err){
                res.redirect("/carts");
            }

            res.render("carts/edit", {cart: foundCart});
        });
    });



//UPDATE CART
router.put("/:id", middleware.checkCartOwnership, function(req, res){
    delete req.body.cart.rating;
    //find and update the cart
    Cart.findByIdAndUpdate(req.params.id, req.body.cart, function(err, updatedCart){
        if(err){
            res.redirect("/carts");
        }
        else{
            res.redirect("/carts/" + req.params.id);
        }
    });
});



// DESTROY CART ROUTE
router.delete("/:id", middleware.checkCartOwnership, function (req, res) {
    Cart.findById(req.params.id, function (err, cart) {
        if (err) {
            res.redirect("/carts");
        } else {
            // deletes all comments associated with the cart
            Comment.remove({"_id": {$in: cart.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/carts");
                }
                // deletes all reviews associated with the cart
                Review.remove({"_id": {$in: cart.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/carts");
                    }
                    //  delete the cart
                    cart.remove();
                    req.flash("success", "cart deleted successfully!");
                    res.redirect("/carts");
                });
            });
        }
    });
});


function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};





//chat
router.get("/:id/chat", isLoggedIn, function(req, res){
    Cart.findById(req.params.id, function(err, foundCart){
      if(err){
        res.redirect("/carts")
      } else {
        res.render("index", {cart: foundCart})
      }
  
  });
  });




  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be signed in to do that!');
    res.redirect('/login');
}





module.exports = router;