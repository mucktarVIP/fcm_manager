var Request = require('./../../models/fcm/request');
var NotificationPayload = require('./../../models/fcm/notificationPayload');
var DataPayload = require('./../../models/fcm/dataPayload');
var Options = require('./../../models/fcm/options');

module.exports = function cartAbandonment(){
  var notification = new NotificationPayload('Cart Abandonment Title');
  var data = new DataPayload();
  var options = new Options();
  var request = new Request();
  
  notification.setBody('Cart Abandonment body');
  notification.setIcon('ic_notification');
  notification.setSound('notification');
  notification.setClickAction('');

  options.setPriority('high');


  request.addNotificationPayload(notification);
  request.addOptions(options);

  return request;
}
