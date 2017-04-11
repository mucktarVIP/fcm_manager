/* @flow */
'use strict';

var _ = require('lodash');

var NotificationPayload = function(title){
  this.title = title;
  this.body = null;
  this.icon = null;
  this.sound = null;
  this.badge = null;
  this.color = null;
  this.clickAction = null;
  this.bodyLocKey = null;
  this.bodyLocArgs = null;
  this.titleLocKey = null;
  this.titleLocArgs = null;
};

NotificationPayload.prototype.setTitle = function(title){
  this.title = title;
};

NotificationPayload.prototype.setBody = function(body){
  this.body = body;
};

NotificationPayload.prototype.setIcon = function(icon){
  this.icon = icon;
};

NotificationPayload.prototype.setSound = function(sound){
  this.sound = sound;
};

NotificationPayload.prototype.setClickAction = function(clickAction){
  this.clickAction = clickAction;
};

NotificationPayload.prototype.build = function(){
  var notificationPayload = {
    title: this.title,
    body: this.body,
    icon: this.icon,
    sound: this.sound,
    badge: this.badge,
    color: this.color,
    click_action: this.clickAction,
    body_loc_key: this.bodyLocKey,
    body_loc_args: this.bodyLocArgs,
    title_loc_key: this.titleLocKey,
    title_loc_args: this.titleLocArgs
  }

  return _.omitBy(notificationPayload, _.isNil);
};

module.exports = NotificationPayload;
