'use strict';

var validate = require("validate.js");
var redisClient = require(appRoot+'/app/adaptors/redis');


module.exports.setFcmIdByUserId = function(request, reply){
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
    reply(new Error('Not a valid data'));
    return;
  }

  redisClient.write(data.userId, data.fcmId)
    .then(function (res){
      var response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'User token succesfully added',
        }),
      };

      reply(null, response);
    })
    .catch(function (err){
      console.error(err);
      reply(new Error('Couldn\'t set the user fcm token, ' + err.code));
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
    reply(new Error('Not a valid data'));
    return;
  }

  redisClient.read(userId)
    .then(function (res){
      var response = {
        statusCode: 200,
        body: JSON.stringify({
          token: res,
        }),
      };

      reply(null, response);
    })
    .catch(function (err){
      console.error(err);
      reply(new Error('Couldn\'t get the user fcm token.'));
      return;
    });
}

