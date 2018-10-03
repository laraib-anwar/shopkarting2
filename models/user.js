var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");
var validator = require("validator");
var UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        minlength: 1
    },
    password: {
        type:String,
        
        minlength: 4
    },
    //avatar: String,
    firstName: String,
    lastName: String,
    email: {
        type: String, 
        unique: true, 
        required: true, 
        minlength: 1, 
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    
    
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verifyToken: String,
    active: Boolean,
    facebook: {
        id: String,
        token: Array,
    },
    google: {
        id: String,
        token: String,
    },
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
