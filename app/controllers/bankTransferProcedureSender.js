'use strict';

var Boom = require('boom');
var messageService = require(appRoot + '/app/services/message.js');
var _ = require('lodash');

var db = config.get('redis').db.bankTransferExpiration;

/**
 * Filter banktransfer message by its lifetime and timespan from last send
 * @param  {Array} messages array of raw redis message
 * @return {array}          array of message meet filter conditions
 */
function filterMessages(messages){
  var bankTransferConfig = config.get('bankTransfer');
  var currentTime = new Date().getTime();
  
  var messages = _.filter(messages, function(message){
    var timeSpent = currentTime - message.created_at;
    var sendLeadTime = message.sent_count * bankTransferConfig.timeSpanBetweenMessage || 0;
    var n = timeSpent - bankTransferConfig.minTimeSpent;

    return n >= 0 && n >= sendLeadTime;
  });
  
  return messages;
}

/**
 * Send message via fcm
 * @param  {Object} messages fcm request model object
 * @return {Promise}         Promise with array of error (if request failed to send) and message_id
 */
function processMessages(messages){
  var sendFcmRequest = _.map(messages, function(fcmRequest){
    return fcmRequest.send(config.get('fcm').serverKey)
  })

  return Promise.all(_.map(sendFcmRequest, function(promise){
    return promise.catch(function(err){
      return {error:err};
    })
  }));
}

/**
 * update last sent param to redis
 * @param  {Array} messages  array of redis message
 * @return {Promise}         promise array of update status
 */
function updateMessage(messages){
  var updateMessage = _.each(messages, function(message){
    var key = message.user_id + '__' + message.payment_id;
    var newMessage = message;
    newMessage.sent_count = message.sent_count + 1;
    
    return messageService.updateMessage(db, key, message);
  });
  
  return Promise.all(updateMessage);
}

module.exports.send = async function(request, reply){
  // fetch message list from redis
  const messages = await messageService.fetchQueue(db)
    // handle rejection
    .catch((err) => {
      return reply(Boom.create(400, 'Message list empty'));
    });
    
  // filter messages which is eligible to send
  const sentMessages =  filterMessages(messages);

  if (!sentMessages.length) {
    return reply(Boom.create(400, 'No message to send'));
  }
  
  // format message to fcm request
  const formattedMessages = await messageService.formatMessages(sentMessages, 'bankTransferProcedure');
  
  // filter succesfully formatted message
  const fcmRequest = _.filter(formattedMessages, (item) => { return !item.error; } );
  
  // check succesfully formatted message is not empty
  if (!fcmRequest.length) {
    return reply(Boom.create(400, 'No user match'));
  }
  
  // send messages
  await processMessages(fcmRequest);
  
  // update sent count
  return updateMessage(sentMessages)
    .then((res) => {
      return reply(Boom.create(200, 'Sent'));
    })
    .catch((err) => {
      return reply(Boom.badRequest(err));
    });
};