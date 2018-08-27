//////////////////////////sw.js
var mongoose = require("mongoose");
mongoose.Promise = Promise;


self.addEventListener('notificationclick', e => {
    var notification = e.notification;
    var action = e.action;

    console.log(notification);

    if(action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    }
    else {
        console.log(action);
        e.waitUntil(
            clients.matchAll()
                .then(_clients => {
                    const client = _clients.find(c => {
                        return c.visibilityState === 'visible';
                    });

                    if(client !== undefined) {
                        client.navigate(notification.data.url);
                        client.focus;
                    }
                    else {
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
                .catch(function(error) {
                    console.log(error);
                })
        )
        notification.close();
    }
});

self.addEventListener('notificationclose', e => {
    console.log('Notification was closed', e);
});

self.addEventListener('push', e => {
    console.log('push notification received', e);

    var data = {title: 'New', content: 'Something new happened',  openUrl: '/'};

    if(e.data) {
        data = JSON.parse(e.data.text());
    }

    var options = {
        body: data.content,
        icon: 'https://cdn3.iconfinder.com/data/icons/line-icons-set/128/1-12-128.png',
        badge: 'https://cdn2.iconfinder.com/data/icons/travel-7/520/shopping-cart-128.png',
        data: {
            url: data.openUrl
        }
    }

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    )
});

