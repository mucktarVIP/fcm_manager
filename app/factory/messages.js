var Request = require('../models/fcm/request');
var NotificationPayload = require('../models/fcm/notificationPayload');
var DataPayload = require('../models/fcm/dataPayload');
var Options = require('../models/fcm/options');
var Moment = require('moment');

module.exports = {
  cartAbandonmentFirstMessage: function(){
    var notification = new NotificationPayload('Jangan lupa!');
    notification.setBody('Barang di keranjang belanja mu akan segera habis. Beli sekarang dan dapatkan 10% VIP Poin');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: 'Barang di keranjang belanja mu akan segera habis. Beli sekarang dan dapatkan 10% VIP Poin',
  		title: 'Jangan lupa!',
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
  },
  pointExpirationMessage: function(message){
    var notification = new NotificationPayload('Point Expiration Title');
    notification.setBody('You have ' + message.expired_point + ' Point out of ' + message.total_point + ' that will be expire on ' + Moment(message.expired_at).format('MMM Do YYYY'));
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: 'You have ' + message.expired_point + ' Point out of ' + message.total_point + ' that will be expire on ' + Moment(message.expired_at).format('MMM Do YYYY'),
  		title: 'Point Expiration Title',
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  },
  orderShippedMessage: function(message){
    var notification = new NotificationPayload('Item Shipped Title');
    notification.setBody('Item shipped body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: 'Item shipped body',
  		title: 'Item Shipped Title',
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  },
  bankTransferProcedure: function(message){
    var notification = new NotificationPayload('Bank Transfer Procedure Title');
    notification.setBody('Bank transfer procedure body');
    notification.setIcon('ic_notification');
    notification.setSound('notification');
    notification.setClickAction('');

    var dataBody = {
  		message: 'Bank transfer procedurebody',
  		title: 'Bank Transfer Procedure Title',
    }

    var data = new DataPayload(dataBody);

    return new Request(null, notification, data);
  }
};
