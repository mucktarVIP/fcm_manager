/* @flow */
'use strict';

var _ = require('lodash');

var Options = function(){
  this.collapse_key = null;
  this.priority = 'high';
  this.content_available = null;
  this.mutable_content = null;
  this.delay_while_idle = null;
  this.time_to_live = null;
  this.restricted_package_name = null;
  this.dry_run = null;
};

Options.prototype.setPriority = function(priority){
  this.priority = priority;
};

Options.prototype.build = function(){
  var options = {
    collapse_key: this.collapse_key,
    priority: this.priority,
    content_available: this.content_available,
    mutable_content: this.mutable_content,
    delay_while_idle: this.delay_while_idle,
    time_to_live: this.time_to_live,
    restricted_package_name: this.restricted_package_name,
    dry_run: this.dry_run
  }

  return _.omitBy(options, _.isNil);
}

module.exports = Options;
