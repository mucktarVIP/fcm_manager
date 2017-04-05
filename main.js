'use strict';
const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ host: '0.0.0.0', port: 80 });
var path = require('path');
global.appRoot = path.resolve(__dirname);

const NS = "/api";
const VERSION = "/v1.0.0";


var fcmController = require(appRoot+"/app/controllers/fcmTokens.js");
server.route([
  { method: 'GET', path:NS+VERSION+'/users/{userId}/fcmId', handler: fcmController.getFcmIdByUserId },
  { method: 'PUT', path:NS+VERSION+'/users/{userId}/fcmId/{fcmId}', handler: fcmController.setFcmIdWithUserId }
]);

server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
});
