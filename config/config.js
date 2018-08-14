module.exports = {

     MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost/shopping_cart',
     PORT: process.env.PORT || 3000,
    'facebook' : {
        'clientID'   : '756916531366509', // you app id
        'clientSecret': '01f65a7986215eaf72fd46b39c12c1c4', //your pp secret
        'callbackURL' : 'http://localhost:3000/auth/facebook/callback',
        'profileURL' : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'email', 'name'] //for requesting permissions from facebook

}
};