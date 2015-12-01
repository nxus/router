/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2015-11-24
*/

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird');

var util = require('util')
var express = require('express');
var _ = require('underscore');
var bodyParser = require('body-parser');
var compression = require('compression');

class Router {

  constructor (app) {

    this.port = app.config.PORT || 3001
    this.routeTable = {}

    this._setupExpress()

    app.on('launch').then(() => {
        app.log('Starting app on port:', this.port);
        this.server = this.expressApp.listen(this.port);
    })

    app.on('stop').then(() => {
      if (this.server) {
        app.log('Shutting down app on port:', this.port);
        this.server.close();
      }
    })
    
    app.get('router').gather('middleware').each(this._setRoute.bind(this))
    .then(() => {return app.get('router').gather('static').each(this._setStatic.bind(this))})
    .then(() => {return app.get('router').gather('route').each(this._setRoute.bind(this))})
     
    this._setupGetters(app)
    this._setupSetters(app)
    this._setupError(app)
  }

  _setupError(app) {
    if (process.env.NODE_ENV == "production") {
      app.on('startup.after').then(() => {
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

  _setupExpress() {
    this.expressApp = express()

    //Setup express app
    this.expressApp.use(compression())
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(bodyParser.json());
    this.expressApp.use((req, res, next) => {
      res.set('Connection', 'close'); //need to turn this off on production environments
      next();
    })
  }

  _setupGetters(app) {
    /*
     * Getters
     */

    app.get('router').on('getRoutes').then((handler) => {
      handler(this.routeTable);
    })

    app.get('router').on('getExpressApp', (handler) => {
      handler(this.expressApp);
    })
  }

  _setupSetters(app) {
    /*
     * Setters
     */

    app.get('router').on('setAssets').then(this._setAssets.bind(this));
    app.get('router').on('setStatic').then(this._setStatic.bind(this));

    app.get('router').on('setRoute').then(this._setRoute.bind(this));

    app.get('router').on('setRoute.get').then((route, handler) => {
      _setRoute(route, handler, 'get');
    })

    app.get('router').on('setRoute.post').then((route, handler) => {
      _setRoute(route, handler, 'post');
    })
  }

  
  _setRoute (method, route, handler) {
    if(!handler) {
      handler = route
      route = method
      method = 'use'
    }
    
    if(_.isString(route)) {
      this.routeTable[route] = handler
      this.expressApp[method](route, handler);
    } else {
      this.expressApp[method](route);
    }
      
  }

  _setStatic (prefix, path) {
    app.log.debug('setting-static', prefix)
    this.expressApp.use(prefix, express.static(path))
  } 

  _setAssets (subPrefix, path) {
    app.log.debug('setting-assets', subPrefix)
    var prefix = "/assets"
    if(subPrefix)
      prefix += subPrefix
    this.expressApp.use(prefix, express.static(path))
  }
}

export default Router