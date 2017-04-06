'use strict';

var redis = require('redis');
var Promise = require('promise');
var config = require(appRoot + '/app/config/app.js');


var options = config.get('redis').connection;

var DB = config.get('redis').db;


function write(key, value){
  return new Promise(function (resolve, reject){
    var client = redis.createClient(options);

    client.on("error", function(err){
      reject(err);
    });

    client.select(DB, function (err, res){
      if (err) reject(err);
      else{
        client.set(key, value, function (err, res){
          if (err) reject(err);
          else{
            resolve(res);
          }
          client.end(true);
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
          // get only handles string
          if (err) reject('Not a valid value');
          else{
            if (res != null) {
              resolve(res);
            }else {
              reject('Key does not exist');
            }
          }

          client.end(true);
        });
      }
    });
  });
}


module.exports = {write: write, read: read};
