'use strict';

var Promise = require('promise');
var converter = require('number-to-words');
var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');

var db = config.get('redis').db.cartAbandonment, sentMessages = [], step=1;

function filterByLifetimes(messages){
  var lifetimes = config.get('lifetimes');
  var currentTime = new Date().getTime();

  var filtered = messages.filter(function(item){
    var timeSpend = currentTime - item.created_at;

    if (step < lifetimes.length - 1) {
      return (timeSpend >= lifetimes[step-1] && timeSpend < lifetimes[step] && !item['is_'+ converter.toWordsOrdinal(step) + '_sent'])
    } else {
      return (timeSpend >= lifetimes[step-1] && !item['is_'+ converter.toWordsOrdinal(step) + '_sent'])
    }
  });

  return filtered;
}

function processMessages(messages){
  var sendFcmRequest = messages.map(function(fcmRequest){
    if(!fcmRequest.error){
      return fcmRequest.send(config.get('fcm').serverKey)
    }
  });

  if (!sendFcmRequest.length) {
    return Promise.reject('Cannot send message, no fcm_user match');
  } else {
    return Promise.all(sendFcmRequest.map(function(promise){
      return promise.catch(function(err){
        return {error:err};
      })
    }));
  }
};

module.exports.first = function(request, reply){
  step = 1;
  // raw message queue
  messageService.fetchQueue(db)
    // filter message by lifetime and sent status
    .then(function(messages){
      var filteredMessages = filterByLifetimes(messages);

      if (!filteredMessages.length){
        return Promise.reject('No message meet the first send condition');
      } else{
        // save filtered message, used later in updating sent status
        sentMessages = filteredMessages;
        return messageService.formatMessages(filteredMessages, 'cartAbandonmentFirstMessage');
      }
    })
    // process message
    .then(processMessages)
    // update redis status for sent message
    .then(function(){
      var updateMessage = sentMessages.map(function(messageItem){
          return messageService.updateSentParam(messageItem, step, db);
      });
      return Promise.all(updateMessage);
    })
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};

module.exports.second = function(request, reply){
  step = 2;

  message.fetchQueue(db)
    .then(function (messages){
      var filteredMessages = filterByLifetimes(messages);

      if (!filteredMessages.length){
        return Promise.reject('No message meet the second send condition');
      } else{
        // save filtered message, used later in updating sent status
        sentMessages = filteredMessages;
        return messageService.formatMessages(filteredMessages, 'cartAbandonmentSecondMessage');
      }
    })
    .then(processMessage)
    .then(function(){
      var updateMessage = sentMessages.map(function(messageItem){
          return messageService.updateSentParam(messageItem, step, db);
      });
      return Promise.all(updateMessage);
    })
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};

module.exports.third = function(request, reply){
  step = 3;

  message.fetchQueue(db)
    .then(function (messages){
      var filteredMessages = filterByLifetimes(messages);

      if (!filteredMessages.length){
        return Promise.reject('No message meet the third send condition');
      } else{
        // save filtered message, used later in updating sent status
        sentMessages = filteredMessages;
        return messageService.formatMessages(filteredMessages, 'cartAbandonmentThirdMessage');
      }
    })
    .then(processMessage)
    .then(function(){
      var deleteMessages = sentMessages.map(function(messageItem){
          // some delete service
      });
      return Promise.all(deleteMessages);
    })
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};
