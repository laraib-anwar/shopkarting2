var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: {type: String, required:true, unique: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verifyToken: String,
    active: Boolean,
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
