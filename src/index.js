/* 
* @Author: Mike Reich
* @Date:   2015-07-16 10:52:58
* @Last Modified 2016-07-27
*/
/**
 * [![Build Status](https://travis-ci.org/nxus/router.svg?branch=master)](https://travis-ci.org/nxus/router)
 * 
 * The Nxus router is an Express compatible web server and router for Nxus applications.
 * 
 * ## Installation
 * 
 * In your Nxus application:
 * 
 *     > npm install nxus-router --save
 * 
 * ## Usage
 * 
 * ### Defining a route
 * 
 *     import router from 'nxus-router'
 * 
 *     router.route('/', (req, res) => {
 *       res.send('Hello World')
 *     })
 * 
 * Alternatively, you can specify a HTTP method:
 * 
 *     router.route('GET', '/', (req, res) => {
 *       res.send('Hello World')
 *     })
 * 
 * ### Adding Express/connect middleware
 * 
 *     router.middleware((req, res) => {
 *       res.status(404).send('Nothing to see here');
 *     })
 * 
 * ### Adding static files/directories
 * 
 *     router.static("my-prefix", myPath)
 * 
 * For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`
 * 
 * Sometimes its good to have a static assets folder where all your assets live. For that reason, you can use the `assets` gatherer.
 * 
 * # API
 * -----
 */

'use strict';

import util from 'util'
import express from 'express'
import _ from 'underscore'
import bodyParser from 'body-parser'
import flash from 'connect-flash'
import compression from 'compression'

import SessionMiddleware from './sessionMiddleware.js'

import {application, NxusModule} from 'nxus-core'

/**
 * @class Router provides Express based HTTP routing
 */
class Router extends NxusModule {
  /**
   * Sets up the relevant gather/providers
   * @param  {Nxus Application} app the App
   */
  constructor (app) {
    super(app)
    this.port = app.config.PORT || 3001
    this.middleware = []
    this.routeTable = []
    this.registered = false

    this
    .respond('middleware', this.setMiddleware.bind(this))
    .respond('static', this.setStatic.bind(this))
    .respond('route', this.setRoute.bind(this))
    .respond('getRoutes')
    .respond('getExpressApp')
    .respond('setStatic')
    .respond('setRoute')

    this._setup()

    application.onceBefore('launch', this._registerRoutes.bind(this));

    application.onceAfter('launch', this.launch.bind(this))

    application.once('stop', this.stop.bind(this))

    new SessionMiddleware(app)
  }

  _setup() {
    this._setupExpress()
    application.once('launch', () => {
      this.expressApp.use((err, req, res, next) => {
        if (application.config.NODE_ENV != "production") return next(err)
        application.log.error(
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
    application.log('Starting app on port:', this.port);
    this.server = this.expressApp.listen(this.port);
  }

  /**
   * Stops the express app. Called by the app.stop event.
   */
  stop() {
    if (this.server) {
      application.log('Shutting down app on port:', this.port);
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
   * @param {string} method  Either 'get', 'post', 'put' or 'delete'. Defaults to 'get'.
   * @param {string} route   A URL route.
   * @param {function} handler  An ExpressJs type callback to handle the route.
   */
  setRoute (method, route, handler) {
    if(!handler) {
      handler = route
      route = method
      method = 'get'
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
    application.log.debug('setting-static', prefix)
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
      application.log.debug('Registering route', r.method, r.route)
      this.expressApp[r.method](r.route, r.handler);
    } else {
      application.log.debug('Registering middleware')
      this.expressApp[r.method](r.route);
    }
  }
}
  
export default Router
export let router = Router.getProxy()
