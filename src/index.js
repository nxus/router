/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2016-02-08
*/

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird');

var util = require('util')
var express = require('express');
var _ = require('underscore');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var compression = require('compression');

/**
 * @class Router provides Express based HTTP routing
 */
class Router {
  /**
   * Sets up the relevant gather/providers
   * @param  {Nxus Application} app the App
   */
  constructor (app) {
    this.app = app
    this.port = app.config.PORT || 3001
    this.routeTable = {}

    app.get('router').use(this)
    .gather('middleware', this.setRoute.bind(this))
    .gather('static', this.setStatic.bind(this))
    .gather('route', this.setRoute.bind(this))
    .gather('asset', this.setStatic.bind(this))
    .respond('getRoutes')
    .respond('getExpressApp')
    .respond('setAssets')
    .respond('setStatic')
    .respond('setRoute')
    .respond('setRoute.get', (route, handler) => {
      this.setRoute('GET', route, handler);
    })
    .respond('setRoute.post', (route, handler) => {
      this.setRoute('POST', route, handler);
    });

    this._setup()

    app.once('launch', this.launch.bind(this))

    app.once('stop', this.stop.bind(this))
    
    app.once('load', this._setup.bind(this));
  }

  _setup() {
    this._setupExpress()
    this.app.onceAfter('startup', () => {
      this.expressApp.use(function errorHandler(err, req, res, next) {
        if (this.app.config.NODE_ENV != "production") return next()
        app.log.error(
          'HTTP 500 error serving request\n\n',
          "Error:\n\n" + err.toString ? err.toString() : "N/A",
          "Error Stack:\n\n" + err.stack ? err.stack : "N/A",
          "User:\n\n" + util.inspect(req.user, {depth: 3}),
          "\n\n\nRequest:\n\n" + util.inspect(req, {depth: 1}),
          err
        )
        res.status(500)
        res.redirect('/error')
      })
    })
  }

  _setupExpress() {
    this.expressApp = express()

    //Setup express app
    this.expressApp.use(compression())
    this.expressApp.use(flash())
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use((req, res, next) => {
      res.set('Connection', 'close'); //need to turn this off on production environments
      next();
    })
  }

  launch() {
    app.log('Starting app on port:', this.port);
    this.server = this.expressApp.listen(this.port);
  }

  stop() {
    if (this.server) {
      app.log('Shutting down app on port:', this.port);
      this.server.close();
    }
  }

  getRoutes() {
    return this.routeTable;
  }

  getExpressApp() {
    return this.expressApp;
  }
  
  setRoute (method, route, handler) {
    if(!handler) {
      handler = route
      route = method
      method = 'use'
    }
    method = method.toLowerCase();

    if(_.isString(route)) {
      this.routeTable[route] = handler
      this.expressApp[method](route, handler);
    } else {
      this.expressApp[method](route);
    }
      
  }

  setStatic (prefix, path) {
    this.app.log.debug('setting-static', prefix)
    this.expressApp.use(prefix, express.static(path))
  } 

  setAssets (subPrefix, path) {
    app.log.debug('setting-assets', subPrefix)
    var prefix = "/assets"
    if(subPrefix)
      prefix += subPrefix
    this.expressApp.use(prefix, express.static(path))
  }
}

export default Router
