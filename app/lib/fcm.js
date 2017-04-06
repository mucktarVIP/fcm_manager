var https = require('https');
var Promise = require('promise');


var FCM = function(serverKey){

  if (!serverKey) {
    throw Error('No Server key');
  } else {
    this.serverKey = serverKey;
  }

  this.options = {
    host: 'fcm.googleapis.com',
    port: 443,
    path: '/fcm/send',
    method: 'POST',
    headers: {}
  };
};

FCM.prototype.send = function(payload){
  var self = this;

  payload = JSON.stringify(payload);

  return new Promise(function (resolve, reject) {
    var options = self.options;
    var headers = {
      'Authorization': 'key=' + self.serverKey,
      'Content-Type': 'application/json',
      'Content-Length': new Buffer(payload).length
    };

    options.headers = headers;

    var request = https.request(options, function(res) {
      var data = '';

      function processResponse(){
        var id = null, error = null;

        if (data.indexOf('\"multicast_id\":')> -1) {
          error = 'InvalidRegistration';
        } else if (data.indexOf('\"message_id\":') > -1) {
          id = data;
        } else if (data.indexOf('\"error\":') > -1){
          error = data;
        } else if (data.indexOf('Unauthorized') > -1) {
          error = 'NotAuthorizedError';
        } else {
          error = 'InvalidServerResponse';
        }

        if (!!id) {
          resolve(data);
        }
        if (!!error){
          reject(error);
        }
      }

      res.on('data', function(chunk) {
        data += chunk;
      });

      res.on('end', processResponse);
      res.on('close', processResponse);
    });

    request.on('error', function(error) {
      reject(error);
    });
    request.write(payload);
    request.end();
  });
};

module.exports = FCM;
