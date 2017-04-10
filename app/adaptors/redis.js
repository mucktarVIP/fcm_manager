'use strict';

var redis = require('redis');
var Promise = require('promise');


function RedisClient(options){
  this.options = {
    host: '127.0.0.1',
    port: 6379
  };

  if (!!options)
    this.options = Object.assign({}, this.options, options);

  this.client = redis.createClient(this.options);

  this.client.on("error", function (err) {
    throw new Error(err);
  });

}

RedisClient.prototype.selectDB = function(db){
  return new Promise((resolve, reject) => {
    this.client.select(db, function (err, res){
      if (err) reject(err);
      else resolve(res);
    });
  });
};

RedisClient.prototype.write = function(key, value){
  return new Promise((resolve, reject) => {
    this.client.set(key, value, function (err, res){
      if (err) reject(err);
      else resolve(res);
    });
  });
};

RedisClient.prototype.read = function(key){
  return new Promise((resolve, reject) => {
    this.client.get(key, function (err, res) {
      // get only handles string value
      if (err) reject('Not a valid value');
      else{
        if (res != null) {
          resolve(res);
        }else {
          reject('Key does not exist');
        }
      }
    });
  });
};

RedisClient.prototype.readBulk = function(keys){
  return new Promise((resolve, reject) => {
    this.client.mget(keys, function (err, res) {
      // get only handles string value
      if (err) reject('Not a valid value');
      else{
        if (res != null) {
          resolve(res);
        }else {
          reject('Key does not exist');
        }
      }
    });
  });
};

RedisClient.prototype.getKeysByPattern = function (pattern){
  return new Promise((resolve, reject) => {
    this.client.keys(pattern, function (err, res){
      if (err) reject(err);
      else{
        resolve(res);
      }
    });
  });
};

module.exports = RedisClient;
