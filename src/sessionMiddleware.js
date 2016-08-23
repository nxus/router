/*
* @Author: mike
* @Date:   2016-05-19 17:28:35
* @Last Modified 2016-07-27
* @Last Modified time: 2016-07-27 08:24:27
*/

'use strict';

import expressSession from 'express-session';
import {router} from './index'
import _ from 'underscore';

var FileStore = require('session-file-store')(expressSession);

export default (app) => {
  router.provideBefore('middleware', expressSession(
    {
      cookie: {
          maxAge: 1000*60*60*24 // 3 hour session
      },
      secret: app.config.namespace || 'appsecret',
      name: app.config.namespace || 'nxus',
      store: new FileStore({path: './.tmp/sessions'}),
      resave: true,
      saveUninitialized: true,
      logFn: app.log.debug
    }
  ))
};
