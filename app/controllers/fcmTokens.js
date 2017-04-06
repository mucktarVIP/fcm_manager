'use strict';

var validate = require("validate.js");
var Boom = require('boom');
var redisClient = require(appRoot+'/app/adaptors/redis.js');


module.exports.setFcmIdWithUserId = function(request, reply){
  var constraints = {
    userId: {
      presence: true,
      numericality: {
        onlyInteger: true,
        greaterThanOrEqualTo: 1
      }
    },
    fcmId: {
      presence: true
    }
  };
  var data = request.params;
  // validation
  var errors = validate(data, constraints);

  if (errors) {
    reply(Boom.badRequest('Not a valid data'));
    return;
  }

  redisClient.write(data.userId, data.fcmId)
    .then(function (res){
      reply({message:'User token succesfully added'}).code(200);
    })
    .catch(function (err){
      reply(Boom.badRequest('Couldn\'t set the user fcm token'));
      return;
    });
}


module.exports.getFcmIdByUserId = function(request, reply){
  var constraints = {
    userId: {
      presence: true,
      numericality: {
        onlyInteger: true,
        greaterThanOrEqualTo: 1
      }
    }
  };
  var userId = request.params.userId;;

  var errors = validate.single(userId, constraints.userId);

  if (errors) {
    reply(Boom.badRequest('Not a valid user'));
  }

  redisClient.read(userId)
    .then(function (res){
      reply({token: res}).code(200);
    })
    .catch(function (err){
      reply(Boom.badRequest(err));
      return;
    });
}
