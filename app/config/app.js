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
      db: {
        userFcm: 1,
        cartAbandonment: 0,
        bankTransferExpiration: 3,
        pointExpiration: 4,
        shipment: 5
      }
    }
  },
  fcm: {
    $filter: 'env',
    dev: {},
    production: {},
    $default: {
      serverKey: 'AAAA9yvVNzQ:APA91bFplvprQicC1rzYKMv9O9OzFS3nKI8DUiH1Ivkfv6jIg7z4gDWKjN92gRWKJZ5uDob4r4aPE36uwaTmnqwShHQ4bo8UR5yI0T0j6fOmtnQH_ZSCTV-v9rH0tdyCYmOfgjrfXia8-YG-APrPsYTz30kB1Od4Rw'
    }
  },
  lifetimes: {
    $filter: 'env',
    dev:[],
    production: [],
    $default: [
      1000 * 60 * 60 * 3,
      1000 * 60 * 60 * 24 * 3,
      1000 * 60 * 60 * 24 * 7
    ]
  }
});

criteria = {
  env: process.env.ENVIRONTMENT
};

module.exports.get = function (key){
  return store.get('/' + key, criteria);
};
