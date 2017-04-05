'use strict';

var redis = require('redis');
var Promise = require('promise');

var options = {
  host: process.env.redisHost,
  port: process.env.redisPort
};

var DB = process.env.redisDBIndex;


function write(key, value){
  return new Promise(function (resolve, reject){
    var client = redis.createClient(options);

    client.on("error", function(err){
      reject(err);
    });

    client.select(DB, function (err, res){
      console.log('select', err, res);
      if (err) reject(err);
      else{
        client.set(key, value, function (err, res){
          if (err) reject(err);
          else{
            resolve(res);
          }
        });
      }
    });
  });
}

function read(key){
  return new Promise(function (resolve, reject){
    var client = redis.createClient(options);

    client.on("error", function (err) {
      reject(err);
    });

    client.select(DB, function (err, res) {
      if (err) reject(err);
      else{
        client.get(key, function (err, res) {
          if (err) reject(err);
          else{
            resolve(res);
          }

        });
      }
    });
  });
}


module.exports = {write: write, read: read};
