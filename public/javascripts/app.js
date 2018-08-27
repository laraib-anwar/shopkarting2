//in javascripts/app.js


var mongoose = require("mongoose");
mongoose.Promise = Promise;


let deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

// Activate Promise polyfill if Promise not supported browser
if(!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('Service worker registered');
        })
        .catch(function(error) {
            console.log(error);
        });
}



var displayConfirmNotification = () => {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(swreg => { // swreg -> Service Worker Registration
                var options = {
                    body: 'You successfully subscribed to our notification service.',
                    icon: 'https://cdn3.iconfinder.com/data/icons/line-icons-set/128/1-12-128.png',
                    //image: '/src/images/sf-boat.jpg',
                    dir: 'ltr',
                    lang: 'en-US', // BCP 47
                    vibrate: [100, 50, 200], // On 100ms, pause 50ms, on 200ms
                    badge: 'https://cdn2.iconfinder.com/data/icons/travel-7/520/shopping-cart-128.png',
                    tag: 'confirm-notification', // tag used for showing only one notification of a tag
                    renotify: false, // New notifications of same tag wont renotify
                    actions: [
                        { action: 'confirm', title:'Okay', icon: 'https://cdn2.iconfinder.com/data/icons/travel-7/520/shopping-cart-128.png'},
                        { action: 'cancel', title:'Cancel', icon: 'https://cdn2.iconfinder.com/data/icons/travel-7/520/shopping-cart-128.png'}
                    ]
                }
                swreg.showNotification('Successfully subscribed!', options)
            });
    }
}

configurePushSub = () => {
    if(!('serviceWorker' in navigator)) {
        return;
    }

    var swreg;
    navigator.serviceWorker.ready
        .then(_swreg => { // Service Worker Registration
            swreg = _swreg;
            return swreg.pushManager.getSubscription();
        })
        .then(sub => {
            if(sub === null) {
                // Create new subscription
                const vapidPublicKey = "BNNAD3MbHd5D7tObdNLzh0JWwq_r0vNFnUoJZ-fRxwfyqslUUSX60KRKSS5IVjsW7GfSAuJe81_UB6Ahdyrx2Fs";
                const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

                return swreg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                });
            }
            else {
                // We have a subscription
            }
        }).catch(function(error) {
        console.log(error);
    })
        .then(newSub => {
            return fetch('\mongodb://localhost/shopping_cart\.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            });
        }).catch(function(error) {
        console.log(error);
    })
        .then(res => {
            if(res.ok) {
                displayConfirmNotification();
            }
        })
        .catch(err => {
            console.log(err)
        });
}

var askForNotificationPermission = () => {
    Notification.requestPermission(result => {
        console.log('User Choice', result);
        if(result !== 'granted') {
            console.log('No notification permission granted!');
        }
        else {
            // displayConfirmNotification();
            configurePushSub();
        }
    })
};

if ('Notification' in window) {
    enableNotificationsButtons.forEach(btn => {
        btn.style.display = 'inline-block';
        btn.onclick = askForNotificationPermission;
    });
}

