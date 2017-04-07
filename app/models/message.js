'use strict';

var RedisClient = require(appRoot + '/app/adaptors/redis.js');
var Promise = require('promise');
var converter = require('number-to-words');
var util = require('util');
var path = require('path');
var fs = require("fs");

var client = new RedisClient(config.get('redis').connection);

module.exports.fetchQueue = function(db){
  return new Promise(function(resolve, reject){
    client.selectDB(db)
      .then(function(){
        return client.getKeysByPattern('*');
      })
      .then(function(keys){
        return client.readBulk(keys);
      })
      .then(function(messages){
        resolve(messages.map(function(message){
          return JSON.parse(message);
        }));
      })
      .catch(function(err){
        reject(err);
      });
  });
}

module.exports.assignFcmToken = function(messages){
  return new Promise(function(resolve, reject){
    client.selectDB(config.get('redis').db.userFcm)
      .then(function(){
        const keys = [];
        for (var i = 0; i < messages.length; i++) {
          keys.push(messages[i].user_id);
        }
        return client.readBulk(keys)
      })
      .then(function(response){
        var assigned = messages.filter(function(message, index){
          if (response[index]) {
            message.to = response[index];
            return true;
          } else {
            return false;
          }
        });

        resolve(assigned);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

module.exports.format = function(messages, type){
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(appRoot, 'app/template/message', type) + '.json', 'utf-8', function(err, data){
      if (err) reject(err);
      else{
        const content = JSON.parse(data);
        let payloads = [];

        for (var i = 0; i < messages.length; i++) {
          let tmpMessage = content;

          tmpMessage.to = util.format(tmpMessage.to, messages[i].to);

          payloads.push(tmpMessage);
        }

        resolve(payloads);
      }
    });
  });
}

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
