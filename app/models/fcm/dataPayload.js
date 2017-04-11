/* @flow */
'use strict';

var DataPayload = function(){
  this.data = {};
};

DataPayload.prototype.toArray = function(){
  return this.data;
}

module.exports = DataPayload;
