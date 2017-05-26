'use strict';

var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');
var _ = require('lodash');


var db = config.get('redis').db.shipment;

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
      return messageService.formatMessages(list, 'orderShippedMessage');
    })
    .then(processMessages)
    .then(function(){
      reply({message: 'Sent'}).code(200);
    })
    .catch(function(err){
      console.log(err);
    });
};