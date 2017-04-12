var Request = require('../models/fcm/request');
var NotificationPayload = require('../models/fcm/notificationPayload');
var DataPayload = require('../models/fcm/dataPayload');
var Options = require('../models/fcm/options');

module.exports = {
  cartAbandonmentFirstMessage: function(){
    var notification = new NotificationPayload('Cart Abandonment First Notification Title');
    notification.setBody('Cart Abandonment first notification body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    return new Request(null, notification);
  },
  cartAbandonmentSecondMessage: function(){
    var notification = new NotificationPayload('Cart Abandonment Second Notification Title');
    notification.setBody('Cart Abandonment second notification body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    return new Request(null, notification);
  }
};
