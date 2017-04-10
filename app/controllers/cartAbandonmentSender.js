'use strict';

var Promise = require('promise');
var converter = require('number-to-words');
var Boom = require('boom');
var message = require(appRoot + '/app/models/message.js');
var Fcm = require(appRoot + '/app/adaptors/fcm.js');


var lifetimes = config.get('lifetimes');
var fcmClient = new Fcm(config.get('fcm').serverKey);

var _messages = [], db = config.get('redis').db.cartAbandonment, step=1;

function filterByLifetimes(messages){
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

function processMessage(messageArray){
  if (!messageArray || !messageArray.length) {
    return Promise.reject('No message to send');
  } else {
    _messages = messageArray;
    return message.format(messageArray, 'cartAbandonment')
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
          updateStack.push(message.updateSentParam(item, step, db));
        });
        return Promise.all(updateStack);
      });
  }
}

module.exports.first = function(request, reply){
  step = 1;
  // raw message queue
  message.fetchQueue(db)
    // assign fcm token
    .then(function(messages){
      // filter lifetimes and not sent
      var filteredMessages = filterByLifetimes(messages, step);

      if (!filteredMessages.length)
        return Promise.reject('No message meet the first send condition');
      else
        return message.assignFcmToken(filteredMessages);
    })
    // process message
    .then(processMessage)
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
      var filteredMessages = filterByLifetimes(messages, step);
      if (!filteredMessages.length)
        return Promise.reject('No message meet the second send condition');
      else
        return message.assignFcmToken(filteredMessages);
    })
    .then(processMessage)
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
      var filteredMessages = filterByLifetimes(messages, step);
      if (!filteredMessages.length)
        return Promise.reject('No message meet the third send condition');
      else
        return message.assignFcmToken(filteredMessages);
    })
    .then(processMessage)
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.error(err);
      reply(Boom.badRequest(err));
    });
};
