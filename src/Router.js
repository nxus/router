/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2015-12-08
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
    this.app = app
    this.port = app.config.PORT || 3001
    this.routeTable = {}

    this._setupExpress()

    app.once('launch', () => {
        app.log('Starting app on port:', this.port);
        this.server = this.expressApp.listen(this.port);
    })

    app.once('stop', () => {
      if (this.server) {
        app.log('Shutting down app on port:', this.port);
        this.server.close();
      }
    })
    
    app.get('router').gather('middleware', this._setRoute.bind(this))
    app.get('router').gather('static', this._setStatic.bind(this));
    app.get('router').gather('route', this._setRoute.bind(this));
    app.get('router').gather('asset', this._setAssets.bind(this));

    app.once('load', () => {
      this._setupGetters(app)
      this._setupSetters(app)
      this._setupError(app)
    });
  }

  _setupError(app) {
    if (process.env.NODE_ENV == "production") {
      app.onceAfter('startup', () => {
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

    app.get('router').respond('getRoutes', () => {
      return this.routeTable;
    })

    app.get('router').respond('getExpressApp', () => {
      return this.expressApp;
    })
  }

  _setupSetters(app) {
    /*
     * Setters
     */

    app.get('router').respond('setAssets', this._setAssets.bind(this));
    app.get('router').respond('setStatic', this._setStatic.bind(this));

    app.get('router').respond('setRoute', this._setRoute.bind(this));

    app.get('router').respond('setRoute.get', (route, handler) => {
      _setRoute('GET', route, handler);
    });

    app.get('router').respond('setRoute.post', (route, handler) => {
      _setRoute('POST', route, handler);
    });
  }

  
  _setRoute (method, route, handler) {
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

  _setStatic (prefix, path) {
    this.app.log.debug('setting-static', prefix)
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
