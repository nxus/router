'use strict';

import sinon from 'sinon'
import {application as app} from 'nxus-core'

import RouterSessions from '../'
import {routerSessions} from '../'

describe("RouterSessions", () => {
  var instance
 
  beforeEach(() => {
    instance = new RouterSessions(app);
  })
  
  describe("Load", () => {
    it("should not be null", () => {
      RouterSessions.should.not.be.null
    })

    it("should be instantiated", () => {
      instance.should.not.be.null;
    })

    it("should have default config", () => {
      let c = instance.config
      c.should.have.property('cookie')
      c.should.have.property('secret')
      c.should.have.property('resave', true)
    })
  });
})
