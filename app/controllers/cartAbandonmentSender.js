'use strict';

var Promise = require('promise');
var converter = require('number-to-words');
var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');
var _ = require('lodash');

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
  var messageNoUserKeys = [];
  var sendFcmRequest = _.omitBy(_.map(messages, function(fcmRequest){
    if(!fcmRequest.error){
      return fcmRequest.send(config.get('fcm').serverKey)
    } else {
      messageNoUserKeys.push(fcmRequest.error.user_id);
    }
  }), _.isNil);

  if (messageNoUserKeys.length) {
    messageService.deleteFromQueue(messageNoUserKeys, db);
    // remove message from update array
    sentMessages = sentMessages.filter(function (item){
      return !_.includes(messageNoUserKeys, item.user_id);
    });
  }

  if (!Object.keys(sendFcmRequest).length) {
    return Promise.reject('Cannot send message, no fcm_user match');
  } else {
    return Promise.all(_.map(sendFcmRequest, function(promise){
      return promise.catch(function(err){
        return {error:err};
      })
    }));
  }
};

module.exports.first = function(request, reply){
  server.log(["info", __filename, arguments.callee.name, "run"], request.params);
  step = 1;
  // raw message queue
  messageService.fetchQueue(db)
    // filter message by lifetime and sent status
    .then(function(messages){
      // filter lifetimes and not sent
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
      var updateMessage = _.map(sentMessages, function(messageItem){
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
  server.log(["info", __filename, arguments.callee.name, "run"], request.params);
  step = 2;

  messageService.fetchQueue(db)
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
    .then(processMessages)
    .then(function(sentStatus){
      var updateMessage = _.map(sentMessages, function(messageItem){
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
  server.log(["info", __filename, arguments.callee.name, "run"], request.params);
  step = 3;

  messageService.fetchQueue(db)
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
    .then(processMessages)
    .then(function(){
      var keys = _.map(sentMessages, function(messageItem){
          return messageItem.user_id;
      });

      return messageService.deleteFromQueue(keys, db);
    })
    .then(function(res){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};
