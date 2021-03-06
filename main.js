const Hapi = require('hapi');
const server = new Hapi.Server();
require("./app/lib/magic.js");

var path = require('path');

global.appRoot = path.resolve(__dirname);
global.config = require(appRoot + '/app/config/app.js');
global.server = server;

server.connection(config.get('server'));

server.on('log', (event, tags) => {
    console.log(event, tags);
});

const NS = "/api";
const VERSION = "/v1.0.0";


var fcmController = require(appRoot+"/app/controllers/fcmTokens.js");
var cartAbandonmentController = require(appRoot+"/app/controllers/cartAbandonmentSender.js");
var pointExpirationController = require(appRoot+"/app/controllers/pointExpirationSender.js");
var orderShippedController = require(appRoot+"/app/controllers/orderShippedSender.js");
var bankTransferProcedureController = require(appRoot+"/app/controllers/bankTransferProcedureSender.js");

server.route([
  { method: 'GET', path:"/stats", handler: function(request, reply){ reply("ok"); } },
  { method: 'GET', path:NS+VERSION+'/users/{userId}/fcmId', handler: fcmController.getFcmIdByUserId },
  { method: 'PUT', path:NS+VERSION+'/users/{userId}/fcmId/{fcmId}', handler: fcmController.setFcmIdWithUserId },

  { method: 'POST', path:NS+VERSION+'/cartAbandonmentSender/first', handler: cartAbandonmentController.first },
  { method: 'POST', path:NS+VERSION+'/cartAbandonmentSender/second', handler: cartAbandonmentController.second },
  { method: 'POST', path:NS+VERSION+'/cartAbandonmentSender/third', handler: cartAbandonmentController.third },
  
  { method: 'POST', path:NS+VERSION+'/pointExpiration', handler: pointExpirationController.send },
  { method: 'POST', path:NS+VERSION+'/orderShipped', handler: orderShippedController.send },
  { method: 'POST', path:NS+VERSION+'/bankTransferProcedure', handler: bankTransferProcedureController.send },
  
]);

server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
