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
 * ## Configuration Options
 *
 *       'router': {
 *         'staticRoutesInSession': false, // Should static routes use sessions
 *         'sessionStoreName': 'file-store-session', // name of a registered session store name
 *         'bodyParserJsonOptions': {'limit': '1mb'}, // Config options for body parser json handling
 *         'bodyParserUrlEncodeOptions': {extended: true, limit: "1mb"}  // Config options for body parser urlencoded form handling,
 *         'bodyParserRawRoutes': ['/route'] // Use raw instead of json processing for these routes
 *         'bodyParserRawOptions': {'type': 'application/json'}  // Config options for raw body parser routes,
 *       }
 *
 * Session store settings (like cookie maxAge, domain) are set per-session-store, e.g.
 *
 *       'waterline_sessions': {
 *         'cookie': {
 *           'maxAge': 86400000,
 *           'domain': '.example.com'
 *         }
 *       }
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
 *
 * @example
 * import {router} from 'nxus-router'
 */
class Router extends NxusModule {

  constructor () {
    super()
    this.port = application.config.PORT || 3001
    this._sessionMiddleware = {}
    this._middlewareStack = []
    this._staticStack = []
    this._routeTable = []
    this.registered = false

    this._setup()

    application.onceBefore('launch', ::this._registerRoutes)

    application.onceAfter('launch', ::this._start)

    application.once('stop', ::this._stop)

  }

  _defaultConfig() {
    return {
      staticRoutesInSession: false,
      sessionStoreName: 'file-store-session',
      bodyParserJsonOptions: {
        limit: "1mb"
      },
      bodyParserUrlEncodeOptions: {
        extended: true,
        limit: "1mb"
      },
      bodyParserRawOptions: {
        type: 'application/json'
      }
    }
  }

  _setup() {
    this._setupExpress()
  }

  _setupExpress() {
    this.expressApp = express()

    //Setup express app

    let jsonParser = bodyParser.json(this.config.bodyParserJsonOptions)
    let rawParser = bodyParser.raw(this.config.bodyParserRawOptions)
    let rawRoutes = this.config.bodyParserRawRoutes
  
    this.expressApp.use(compression())
    this.expressApp.use(bodyParser.urlencoded(this.config.bodyParserUrlEncodeOptions))
    this.expressApp.use((req, res, next) => {
      if (rawRoutes.includes(req.originalUrl)) {
        rawParser(req, res, next)
      } else {
        jsonParser(req, res, next)
      }
    })
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
    return this._routeTable
  }

  /**
   * Returns the Express App instance.
   * @return {Instance} ExpressJs app instance.
   */
  getExpressApp() {
    return this.expressApp
  }

  /**
   * Sets the middleware handler for sessions, first in the configured stack
   * @param {string} name       If config names a session handler, only that name will be accepted
   * @param {function} handler  An ExpressJs type callback to handle the route.
   */
  sessionMiddleware (name, handler) {
    if(this.registered) throw new Error("Tried to set session middleware, but already launched:", handler)
    this.log.debug("Registered session middleware", name)
    this._sessionMiddleware[name] = {method:'use', route:handler, name}
  }

  /**
   * Adds a middleware handler to the internal routing table passed to Express
   * @param {string} route   A URL route or the handler for all routes
   * @param {function} handler  An ExpressJs type callback to handle the route.
   * @param {string} [method]  optional HTTP method, defaults to all ('use')
   */
  middleware (route, handler, method='use') {
    this._middlewareStack.push({method, route, handler})
    if(this.registered) this._registerRoute({method, route, handler})
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

    this._routeTable.push({method, route, handler})
    if(this.registered) this._registerRoute({method, route, handler})
  }

  /**
   * Adds a path to serve static files.
   * @param {string} prefix The path at which the static files will be accessible. For example: "/js"
   * @param {string} path   A fully resolved path.
   */
  staticRoute (prefix, path) {
    this.log.debug('Adding static route', prefix)
    let method = 'use'
    let route = prefix
    let handler = express.static(path)
    this._staticStack.push({method, route, handler})
    if(this.registered) this._registerRoute({method, route, handler})
  }

  async _registerRoutes () {
    this.registered = true
    let register = ::this._registerRoute

    if (! this.config.staticRoutesInSession) {
      this._staticStack.forEach(register)
    }
    let sessionStoreName = this.config.sessionStoreName
    if(this._sessionMiddleware[sessionStoreName]) {
      let m = this._sessionMiddleware[sessionStoreName]
      m.route = await m.route()
      register(m)
    } else if (sessionStoreName) {
      this.log.warn(`No sessions enabled: sessionStoreName ${sessionStoreName} configured but not registered: (${_.keys(this._sessionMiddleware)})`)
    }
    if (this.config.staticRoutesInSession) {
      this._staticStack.forEach(register)
    }

    this._middlewareStack.forEach(register)
    this._routeTable.reverse().forEach(register)
  }

  _registerRoute(r) {
    if(_.isString(r.route)) {
      this.log.debug('Registering route', r.method, r.route)
      this.expressApp[r.method](r.route, r.handler)
    } else {
      this.log.debug('Registering middleware', r.name ? r.name : "")
      this.expressApp[r.method](r.route)
    }
  }
}

export default Router
export let router = Router.getProxy()
