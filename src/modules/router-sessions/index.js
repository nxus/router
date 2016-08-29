/*
* @Author: mike
* @Date:   2016-05-19 17:28:35
* @Last Modified 2016-08-26
* @Last Modified time: 2016-08-26 14:15:48
*/

'use strict';

import expressSession from 'express-session';
import {router} from '../../'
import _ from 'underscore';

import {application, NxusModule} from 'nxus-core'

var FileStore = require('session-file-store')(expressSession);

class RouterSessions extends NxusModule {
  constructor(app) {
    super(app)

    let settings = this.config
    // TODO move this to router-sessions-file - but need access EARLY
    settings.store = new FileStore({path: './.tmp/sessions'})
    settings.logFn = application.log.debug

    router.default('middleware', expressSession(settings))
  }

  _defaultConfig() {
    return {
      cookie: {
        maxAge: 1000*60*60*24
      },
      secret: application.config.namespace || 'appsecret',
      name: application.config.namespace || 'nxus',
      resave: true,
      saveUninitialized: true,
    }
  }

};

export default RouterSessions
export let routerSessions = RouterSessions.getProxy()
