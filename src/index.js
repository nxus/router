/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2016-02-18
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
    this.middleware = []
    this.routeTable = []
    this.registered = false

    app.get('router').use(this)
    .gather('middleware', this.setMiddleware.bind(this))
    .gather('static', this.setStatic.bind(this))
    .gather('route', this.setRoute.bind(this))
    .respond('getRoutes')
    .respond('getExpressApp')
    .respond('setStatic')
    .respond('setRoute')
    .respond('setRoute.get', (route, handler) => {
      this.setRoute('GET', route, handler);
    })
    .respond('setRoute.post', (route, handler) => {
      this.setRoute('POST', route, handler);
    });

    this._setup()

    app.once('launch.before', this._registerRoutes.bind(this));

    app.once('launch', this.launch.bind(this))

    app.once('stop', this.stop.bind(this))
  }

  _setup() {
    this._setupExpress()
    this.app.once('startup', () => {
      this.expressApp.use((err, req, res, next) => {
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

  /**
   * Launches the Express app. Called by the app.load event.
   */
  launch() {
    this.app.log('Starting app on port:', this.port);
    this.server = this.expressApp.listen(this.port);
  }

  /**
   * Stops the express app. Called by the app.stop event.
   */
  stop() {
    if (this.server) {
      this.app.log('Shutting down app on port:', this.port);
      this.server.close();
    }
  }

  /**
   * Returns the internal routing table.
   * @return {array} routes which have been registered
   */
  getRoutes() {
    return this.routeTable;
  }

  /**
   * Returns the Express App instance.
   * @return {Instance} ExpressJs app instance.
   */
  getExpressApp() {
    return this.expressApp;
  }

  /**
   * Adds a middleware handler to the internal routing table passed to Express. Accessed with 'middleware' gather.
   * @param {string} route   A URL route.
   * @param {function} handler  An ExpressJs type callback to handle the route.
   */
  setMiddleware (route, handler, method='use') {
    this._registerRoute({method, route, handler})
  }

  /**
   * Adds a route to the internal routing table passed to Express. Accessed with the 'route' gather.
   * @param {string} method  Either 'get', 'post', 'put' or 'delete'.
   * @param {string} route   A URL route.
   * @param {function} handler  An ExpressJs type callback to handle the route.
   */
  setRoute (method, route, handler) {
    if(!handler) {
      handler = route
      route = method
      method = 'use'
    }
    method = method.toLowerCase();

    this.routeTable.push({method, route, handler})
    if(this.registered) this._registerRoute({method, route, handler})
  }

  /**
   * Adds a path to serve static files. 
   * @param {string} prefix The path at which the static files will be accessible. For example: /js
   * @param {string} path   A fully resolved path.
   */
  setStatic (prefix, path) {
    this.app.log.debug('setting-static', prefix)
    this.expressApp.use(prefix, express.static(path))
  }

  _registerRoutes () {
    this.registered = true
    this.routeTable.reverse().forEach((r) => {
      this._registerRoute(r)
    })
  } 

  _registerRoute(r) {
    if(_.isString(r.route)) {
      this.app.log.debug('Registering route', r.method, r.route)
      this.expressApp[r.method](r.route, r.handler);
    } else {
      this.app.log.debug('Registering middleware')
      this.expressApp[r.method](r.route);
    }
  }
}
  
export default Router
