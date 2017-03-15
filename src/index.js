/**
 * # Router Module
 * 
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
 *     import {router} from 'nxus-router'
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
 *       res.status(404).send('Nothing to see here')
 *     })
 * 
 * ### Adding static files/directories
 * 
 *     router.staticRoute("/my-prefix", myPath)
 * 
 * For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`
 * 
 * 
 */

'use strict'

import util from 'util'
import express from 'express'
import _ from 'underscore'
import bodyParser from 'body-parser'
import compression from 'compression'

import {application, NxusModule} from 'nxus-core'

/**
 * Router provides Express based HTTP routing
 *
 * @example
 * import {router} from 'nxus-router'
 */
class Router extends NxusModule {

  constructor () {
    super()
    this.port = application.config.PORT || 3001
    this.routeTable = []
    this.registered = false

    this._setup()

    application.onceBefore('launch', ::this._registerRoutes)

    application.onceAfter('launch', ::this._start)

    application.once('stop', ::this._stop)

  }

  _setup() {
    this._setupExpress()
  }

  _setupExpress() {
    this.expressApp = express()

    //Setup express app
    
    this.expressApp.use(compression())
    this.expressApp.use(bodyParser.urlencoded({ extended: true }))
    this.expressApp.use(bodyParser.json({limit: "1mb"}))
    if(application.config.NODE_ENV != 'production') {
      this.expressApp.use((req, res, next) => {
        res.set('Connection', 'close') //need to turn this off on production environments
        next()
      })
    }
  }

  /**
   * @private
   * Launches the Express app. Called by the app.load event.
   */
  _start() {
    this.log.info('Starting express, available at http://localhost:'+this.port)
    this.server = this.expressApp.listen(this.port)
  }

  /**
   * @private
   * Stops the express app. Called by the app.stop event.
   */
  _stop() {
    if (this.server) {
      this.log.info('Shutting down express on port:', this.port)
      this.server.close()
    }
  }

  /**
   * Returns the internal routing table.
   * @return {array} routes which have been registered
   */
  getRoutes() {
    return this.routeTable
  }

  /**
   * Returns the Express App instance.
   * @return {Instance} ExpressJs app instance.
   */
  getExpressApp() {
    return this.expressApp
  }

  /**
   * Adds a middleware handler to the internal routing table passed to Express
   * @param {string} route   A URL route or the handler for all routes
   * @param {function} handler  An ExpressJs type callback to handle the route.
   * @param {string} [method]  optional HTTP method, defaults to all ('use')
   */
  middleware (route, handler, method='use') {
    this._registerRoute({method, route, handler})
  }

  /**
   * Adds a route to express.
   * @param {string} [method]  Either 'get', 'post', 'put' or 'delete'. Defaults to 'get'.
   * @param {string} route   A URL route.
   * @param {function} handler  An ExpressJs type callback to handle the route.
   */
  route (method, route, handler) {
    if(!handler) {
      handler = route
      route = method
      method = 'get'
    }
    method = method.toLowerCase()

    this.routeTable.push({method, route, handler})
    if(this.registered) this._registerRoute({method, route, handler})
  }

  /**
   * Adds a path to serve static files. 
   * @param {string} prefix The path at which the static files will be accessible. For example: "/js"
   * @param {string} path   A fully resolved path.
   */
  staticRoute (prefix, path) {
    this.log.debug('Adding static route', prefix)
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
      this.log.debug('Adding route', r.method, r.route)
      this.expressApp[r.method](r.route, r.handler)
    } else {
      this.log.debug('Adding middleware')
      this.expressApp[r.method](r.route)
    }
  }
}

export default Router
export let router = Router.getProxy()
