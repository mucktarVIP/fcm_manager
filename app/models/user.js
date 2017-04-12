var RedisClient = require(appRoot + '/app/adaptors/redis.js');

var client = new RedisClient(config.get('redis').connection);
var db = config.get('redis').db.userFcm;

var User = function(userId){
  this.userId = userId;
};

User.prototype.getFcmToken = function(){
  var self = this;
  return client.selectDB(db)
    .then(function(){
      return client.read(self.userId);
    });
};

User.prototype.setFcmToken = function(token){
  var self = this;
  return client.selectDB(self.db)
    .then(function(){
      return client.write(self.userId, token);
    });
};

module.exports = User;
