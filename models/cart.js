var mongoose = require("mongoose");

var cartSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    price: Number,
    like: Number,
    createdAt: {type: Date, default: Date.now()},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]

});

module.exports = mongoose.model("Cart", cartSchema);