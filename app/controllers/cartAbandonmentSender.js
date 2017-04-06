'use strict';

var Promise = require('promise');
var converter = require('number-to-words');
var Boom = require('boom');
var message = require(appRoot + '/app/lib/message.js');
var Fcm = require(appRoot + '/app/lib/fcm.js');


var lifetimes = config.get('lifetimes');
var fcmClient = new Fcm(config.get('fcm').serverKey);

module.exports.first = function(request, reply){
  var _messages = [], db = config.get('redis').db.cartAbandonment;
  // raw message queue
  message.fetchQueue(db)
    // assign fcm token
    .then(function(messages){
      var currentTime = new Date().getTime();
      // filter lifetimes and not sent
      var validMessages = messages.filter(function(item){
        var timeSpend = currentTime - item.created_at;
        if (timeSpend >= lifetimes[0] && timeSpend < lifetimes[1] && !item['is_'+ converter.toWordsOrdinal(1) + '_sent']) {
          return item;
        }
      });

      return message.assignFcmToken(validMessages);
    })
    // format message
    .then(function(assignedMessages){
      // save message for update sent param
        if (!assignedMessages || !assignedMessages.length) {
          return Promise.reject('No message to send');
        } else {
          _messages = assignedMessages;
          return message.format(assignedMessages, 'cartAbandonment');
        }
    })
    // send
    .then(function(payloads){
      let sendStack = [];
      payloads.forEach(function(payload) {
        sendStack.push(fcmClient.send(payload));
      });

      return Promise.all(sendStack);
    })
    // update sent param;
    .then(function(res){
      let updateStack = [];
      _messages.forEach(function(item) {
        updateStack.push(message.updateSentParam(item, 1, db));
      });
      return Promise.all(updateStack);
    })
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};

module.exports.second = function(){

};

module.exports.third = function(){

};
