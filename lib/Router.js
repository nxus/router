/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2015-07-16
*/

'use strict';

var util = require('util')
var express = require('express');
var _ = require('underscore');
var bodyParser = require('body-parser');
var compression = require('compression');

var app;

class Router {

  constructor (a) {
    app = a;

    this.port = app.config.PORT || 3001
    this.routeTable = {}

    this.expressApp = express()

    //Setup express app
    this.expressApp.use(compression())
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(function(req, res, next) {
      res.set('Connection', 'close'); //need to turn this off on production environments
      next();
    })

    /*
     * Plugin Methods
     */

    app.on('app.startup.after', () => {
        app.log('Starting app on port:', this.port);
        this.server = this.expressApp.listen(this.port);
    })

    app.on('app.stop', () => {
      if (this.server) {
        app.log('Shutting down app on port:', this.port);
        this.server.close();
      }
    })

    this._setupGatherers()
    this._setupGetters()
    this._setupSetters()
  }

  _setupGatherers() {
    /* 
     * Gatherers
     */

    app.on('app.startup.before', () => {
      app.emit('router.gatherMiddleware', this._setRoute.bind(this));
      app.emit('router.gatherStatic', this._setStatic.bind(this));
    })

    app.on('app.startup', () => {
      app.emit('router.gatherRoutes', this._setRoute.bind(this));
    })

    if (process.env.NODE_ENV == "production") {
      app.on('app.startup.after', () => {
        this.expressApp.use(function errorHandler(err, req, res, next) {
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
  }

  _setupGetters() {
    /*
     * Getters
     */

    app.on('router.getRoutes', (handler) => {
      handler(this.routeTable);
    })

    app.on('router.getExpressApp', (handler) => {
      handler(this.expressApp);
    })
  }

  _setupSetters() {
    /*
     * Setters
     */

    app.on('router.setStatic', this._setStatic.bind(this));

    app.on('router.setRoute', this._setRoute.bind(this));

    app.on('router.setRoute.get', function (route, handler) {
      _setRoute(route, handler, 'get');
    })

    app.on('router.setRoute.post', function (route, handler) {
      _setRoute(route, handler, 'post');
    })
  }

  
  _setRoute (route, handler, method) {
    method = method || 'use'
    
    if(_.isString(route)) {
      this.routeTable[route] = handler
      this.expressApp[method](route, handler);
    } else {
      this.expressApp[method](route);
    }
      
  }

  _setStatic (path, subPrefix) {
    app.log.debug('setting-static', subPrefix)
    var prefix = "/assets"
    if(subPrefix)
      prefix += subPrefix
    this.expressApp.use(prefix, express.static(path))
  }
}

module.exports = Router