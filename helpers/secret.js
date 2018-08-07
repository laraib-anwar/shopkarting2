module.exports = {
    'facebook': {
        'clientID': '243117269820289',
        'clientSecret': 'f882d65ecbb57156eb553cdcf3e381f3',
    },
    google: {
        clientID:'717428559072-rbfifps4p88ahhikne7dtpsmmdb0ib3k.apps.googleusercontent.com',
        clientSecret:'3fAwTQALW1FpAtv6ma6JyhwK',
    }
};





//req.headers['x-forwarded-for'] || req.connection.remoteAddress





//============================this is for the gmailverifcation for the add cart route that will be used in the mddleware index.js replace it with line 65
// middlewareObj.isLoggedIn = function(req, res, next){
//     var active;
//     if(req.isAuthenticated()) {
//         function verify() {
//             User.findOne({email: req.user.email}, function (err, user) {
//                 //console.log("1      ", user);
//                 active = user.active;
//                 if (active == true) {
//                     return next();
//                 }
//                 req.flash("error", "You need to verify your email to see the content!!");
//                 res.redirect("/carts");
//             });
//         }
//         return verify();
//     }else{
//         req.flash("error", "You need to be logged in to do that!!");
//
//         res.redirect("/login");
//     }
// };
