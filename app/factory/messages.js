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

    var dataBody = {
  		message: "Cart Abandonment first data message",
  		title: "Cart Abandonment first data title",
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  },
  cartAbandonmentSecondMessage: function(){
    var notification = new NotificationPayload('Cart Abandonment Second Notification Title');
    notification.setBody('Cart Abandonment second notification body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: "Cart Abandonment second data message",
  		title: "Cart Abandonment second data title",
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  },
  cartAbandonmentThirdMessage: function(){
    var notification = new NotificationPayload('Cart Abandonment Third Notification Title');
    notification.setBody('Cart Abandonment third notification body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: "Cart Abandonment third data message",
  		title: "Cart Abandonment third data title",
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  }
};
