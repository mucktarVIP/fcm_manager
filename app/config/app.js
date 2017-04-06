var Confidence, criteria, store;

Confidence = require('confidence');

store = new Confidence.Store({
  server: {
    $filter: 'env',
    dev: {},
    production: {},
    $default: {
      host: '127.0.0.1',
      port: 8000
    }
  },
  redis: {
    $filter: 'env',
    dev: {},
    production: {},
    $default: {
      connection: {
        host: "127.0.0.1",
        port: 6379
      },
      db: 1
    }
  }
});

criteria = {
  env: process.env.ENVIRONTMENT
};

module.exports.get = function (key){
  return store.get('/' + key, criteria);
};
