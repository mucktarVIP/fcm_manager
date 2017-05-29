'use strict';

var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');
var _ = require('lodash');

var db = config.get('redis').db.bankTransferExpiration;
var bankTransferConfig = config.get('bankTransfer');
var sentMessages = [];

function filterMessages(messages){
  var currentTime = new Date().getTime();
  
  var messages = _.filter(messages, function(message){
    var timeSpent = currentTime - message.created_at;
    var sendLeadTime = message.sent_count * bankTransferConfig.timeSpanBetweenMessage || 0;
    var n = timeSpent - bankTransferConfig.minTimeSpent;

    return n >= 0 && n >= sendLeadTime;
  });
  
  return messages;
}

function processMessages(messages){
  var sendFcmRequest = _.omitBy(_.map(messages, function(fcmRequest){
    if(!fcmRequest.error){
      return fcmRequest.send(config.get('fcm').serverKey)
    }
  }), _.isNil);

  if (!Object.keys(sendFcmRequest).length) {
    return Promise.reject('Cannot send message, no fcm_user match');
  } else {
    return Promise.all(_.map(sendFcmRequest, function(promise){
      return promise.catch(function(err){
        return {error:err};
      })
    }));
  }
}

module.exports.send = function(request, reply){
  messageService.fetchQueue(db)
    .then(function(list){
      sentMessages = filterMessages(list);
      if (!sentMessages.length) {
        return Promise.reject('No message to send');
      }
      return messageService.formatMessages(sentMessages, 'bankTransferProcedure');
    })
    .then(processMessages)
    .then(function(){
      var updateMessage = _.each(sentMessages, function(message){
        var key = message.user_id + '__' + message.payment_id;
        var newMessage = message;
        newMessage.sent_count = message.sent_count + 1;
        
        return messageService.updateMessage(db, key, message);
      });
      
      return Promise.all(updateMessage);
    })
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.log(err);
    });
};