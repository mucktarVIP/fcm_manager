'use strict';

var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');
var _ = require('lodash');

var db = config.get('redis').db.pointExpiration;
var minAmount = config.get('pointExpiration').minAmount;
var daysBeforeExpire = config.get('pointExpiration').daysBeforeExpire;
var sentMessages = [];

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

function formatMessageData(groupedMessages){
  var currentTime = new Date().getTime();
  var expireTime = currentTime + (daysBeforeExpire * 24 * 60 * 60 * 1000);
  var messageFormatData = [];
  
  _.each(groupedMessages, function(messages, userId){
    var totalPoint = 0;
    var expiredPoint = 0;
    var expiredAt = 0;
    
    _.each(messages, function(message){
      if (message.expired_at <= expireTime) {
        expiredPoint += message.amount;
        expiredAt += message.expired_at;
      }
      
      totalPoint += message.amount;
      
      messageFormatData.push({
        'user_id': userId,
        'expired_point': expiredPoint,
        'expired_at': expiredAt,
        'total_point': totalPoint
      });
    });
  });

  return Promise.resolve(messageFormatData);
}

function groupExpiredMessages(messages){
  var groupedMessages = _.groupBy(messages, 'user_id');
  var expiredMessages = {};
  
  _.each(groupedMessages, function(messages, userId){
    if (expiredPointExist(messages)) {
      expiredMessages[userId] = messages;
    }
  });
  
  if (!_.size(expiredMessages)) {
    return Promise.reject('No expired point found');
  }
  
  return Promise.resolve(expiredMessages);
}

function expiredPointExist(message){
  var currentTime = new Date().getTime();
  var expireTime = currentTime + (daysBeforeExpire * 24 * 60 * 60 * 1000);
  
  var exist = _.filter(message, function(item){
    return item.expired_at <= expireTime && item.amount >= minAmount;
  });
  
  return exist.length > 0;
}

module.exports.send = function(request, reply){
  messageService.fetchQueue(db)
    .then(groupExpiredMessages)
    .then(formatMessageData)
    .then(function(messages){
      return messageService.formatMessages(messages, 'pointExpirationMessage');
    })
    .then(processMessages)
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
}
