module.exports = {
    'facebookAuth' : {
        'clientID'   : '756916531366509', // you app id
        'clientSecret': '01f65a7986215eaf72fd46b39c12c1c4', //your pp secret
        'callbackURL' : 'http://shopkarting.in/auth/facebook/callback'
        //'profileURL' : 'https://graph.facebook.com/v2.5/me?fields=first_name,email,last_name',
        //'profileFields': ['id', 'email', 'name'] //for requesting permissions from facebook

},

    'googleAuth' : {
        'clientID': '198040227451-0ant77n01m2p1fqoue8g6j899kb00lt3.apps.googleusercontent.com', // you app id
        'clientSecret': 'JK6wWuXZyEjD-paw-1PgZ0cN', //your pp secret
        'callbackURL': 'http://www.shopkarting.in/auth/google/callback'
        //'profileURL' : 'https://graph.facebook.com/v2.5/me?fields=first_name,email,last_name',
        //'profileFields': ['id', 'email', 'name'] //for requesting permissions from google
    }
};




// // expose our config directly to our application using module.exports
// module.exports = {
//     'facebookAuth' : {
//         'clientID'      : '756916531366509',  // your App ID
//         'clientSecret'  : 'JK6wWuXZyEjD-paw-1PgZ0cN',  // your App Secret
//         'callbackURL'   : 'http://localhost:3000/auth/facebook/callback',
//     //     'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name',
//     //     'profileFields' : ['id', 'name'] // For requesting permissions from Facebook API
//      }
// };
//
