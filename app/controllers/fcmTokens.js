var validate = require("validate.js");
var Boom = require('boom');
var RedisClient = require(appRoot + '/app/adaptors/redis.js');
var User = require(appRoot + '/app/models/user.js');

module.exports.setFcmIdWithUserId = function(request, reply){
  server.log(["info", __filename+":"+__line, __function, "run"], request.params);
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
  
  var user = new User(data.userId);

  user.setFcmToken(data.fcmId)
    .then(function (res){
      reply({message:'User token succesfully added'}).code(200);
    })
    .catch(function (err){
      reply(Boom.badRequest('Couldn\'t set the user fcm token'));
    });
}


module.exports.getFcmIdByUserId = function(request, reply){
  server.log(["info", __filename+":"+__line, __function, "run"], request.params);
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

  var user = new User(userId);

  user.getFcmToken()
    .then(function (res){
      reply({token: res}).code(200);
    })
    .catch(function (err){
      reply(Boom.badRequest(err));
    });
}
