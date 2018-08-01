const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");
const msg = {
    to: 'laraib.anwar919@gmail.com',
    from: 'verify@shop-kart.in',
    subject: 'ShopKart email verification',
    text: 'Please click on the link, or paste this into your browser to complete the verification process:\n\n' +
    'If you did not request this, please ignore this email.'
};
sgMail.send(msg);