/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:42
* @Last Modified 2015-07-16
*/

'use strict';

var Router = require('./lib/Router')

module.exports = function(app, loaded) {
  new Router(app, loaded)
}