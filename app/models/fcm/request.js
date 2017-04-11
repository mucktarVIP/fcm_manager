/* @flow */
'use strict';

var Fcm = require('./../../adaptors/fcm.js');
var _ = require('lodash');

var Request = function(){
  this.to = '';
  this.topic = null;
  this.options = {};
  this.notification = {};
  this.data = {};
};

Request.prototype.addTo = function(to){
  this.to = to;
}

Request.prototype.addTopic = function(topic){
  this.topic = topic;
}

Request.prototype.addOptions = function(options){
  this.options = options;
}

Request.prototype.addNotificationPayload = function(payload){
  this.notification = payload;
}

Request.prototype.addDataPayload = function(payload){
  this.data = payload;
}

Request.prototype.build = function(){
  var request = {
    to: this.to,
    topic: this.topic,
    notification: this.notification.build(),
    data: this.data.build()
  }

  request = _.merge(request, this.options.build());

  return _.omitBy(request, _.isNil);
}

Request.prototype.send = function(serverKey){
  var fcmClient = new Fcm(serverKey);

  var requestArray = this.build();

  return fcmClient.send(requestArray);
}

module.exports = Request;
