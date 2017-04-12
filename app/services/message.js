'use strict';

var RedisClient = require(appRoot + '/app/adaptors/redis.js');
var User = require(appRoot + '/app/models/user.js');
var Promise = require('promise');
var converter = require('number-to-words');
var util = require('util');
var path = require('path');
var fs = require("fs");

var messageFactory = require(appRoot + '/app/factory/messages.js');

var client = new RedisClient(config.get('redis').connection);

module.exports.fetchQueue = function(db){
  return new Promise(function(resolve, reject){
    client.selectDB(db)
      .then(function(){
        return client.getKeysByPattern('*');
      })
      .then(function(keys){
        if(!keys.length)
          return Promise.reject('Message empty');

        return client.readBulk(keys);
      })
      .then(function(messageArray){
        resolve(messageArray.map(function(message){
          return JSON.parse(message);
        }));
      })
      .catch(function(err){
        reject(err);
      });
  });
}

module.exports.formatMessages = function(messages, messageType){
  var self = this;
  var formatMessages = messages.map(function(messageItem){
    return self.generateFcmRequest(messageItem, messageType);
  });

  return Promise.all(formatMessages.map(function(promise){
    return promise.catch(function(err){
      return {error:err};
    });
  }));
}

module.exports.generateFcmRequest = function(message, messageType){
  return new Promise(function(resolve, reject){
    var request = messageFactory[messageType]();
    var user = new User(message.user_id);
    // assign token
    user.getFcmToken()
      .then(function(token){
        request.addTo(token);
        resolve(request);
      })
      .catch(function(){
        reject('no matched user from fcm_user');
      });
  })
};

module.exports.updateSentParam = function(message, nth, db){
  message['is_'+ converter.toWordsOrdinal(nth) + '_sent'] = true;
  return new Promise(function(resolve, reject){
    client.selectDB(db)
      .then(function(){
        return client.write(message.user_id, JSON.stringify(message))
      })
      .then(function(res){
        console.log('update success', res);
        resolve(res);
      })
      .catch(function(err){
        console.log('update error', err);
        reject(err);
      });
  });
}

module.exports.deleteFromQueue = function(keys, db){
  return client.selectDB(db)
    .then(function(){
      return client.deleteBulk(keys);
    })
}
