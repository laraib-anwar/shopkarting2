var express = require("express");
var router = express.Router();
var Cart = require("../models/cart");
var middleware = require("../middleware");
var request = require("request");
var multer = require('multer');
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
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dtjn1orb0',
    api_key: "789532569495242",
    api_secret: "DUGsVTcR0VKVWBI0WJDdfxqKY08"
});



//INDEX - SHOW ALL CARTS
router.get("/",function(req,res){
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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the cart object under image property
        req.body.cart.image = result.secure_url;
        // add author to cart
        req.body.cart.author = {
            id: req.user._id,
            username: req.user.username
        }
        Cart.create(req.body.cart, function(err, cart) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/carts/' + cart.id);
        });
    });
});












//NEW SHOW FORM TO CREATE A CART
router.get("/new", middleware.isLoggedIn, function (req,res){
    res.render("carts/new");
});


//SHOW CART  -shows more info about one CART

router.get("/:id", function(req,res){
    //find the cart with unique id

    Cart.findById(req.params.id).populate("comments").exec(function(err, foundCart){
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

            res.render("carts/edit", {cart: foundCart});
        });
    });



//UPDATE CART
router.put("/:id", middleware.checkCartOwnership, function(req, res){
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












//DESTROY CART ROUTE
router.delete("/:id",  middleware.checkCartOwnership, function(req, res){
    //destroy cart
    Cart.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/carts");
        }
        else{
            res.redirect("/carts");
        }
    });
});


function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};




module.exports = router;