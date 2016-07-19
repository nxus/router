/*
* @Author: mike
* @Date:   2016-05-19 17:28:35
* @Last Modified 2016-05-20
* @Last Modified time: 2016-05-20 09:13:36
*/

'use strict';

import expressSession from 'express-session';
import _ from 'underscore';
var FileStore = require('session-file-store')(expressSession);

export default (app) => {
  app.get('router').provideBefore('middleware', expressSession(
    {
      cookie: {
          maxAge: 1000*60*60*24 // 3 hour session
      },
      secret: app.config.namespace || 'appsecret',
      name: app.config.namespace || 'nxus',
      store: new FileStore,
      resave: true,
      saveUninitialized: true,
      logFn: app.log.debug
    }
  ))
};
