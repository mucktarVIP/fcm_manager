'use strict';

var DataPayload = function(data){
  this.data = data;
};

DataPayload.prototype.get = function(){
  return this.data;
}

module.exports = DataPayload;
