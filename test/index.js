/* 
* @Author: Mike Reich
* @Date:   2015-11-06 17:10:00
* @Last Modified 2016-08-22
*/

'use strict';

import sinon from 'sinon'
import {application as app} from 'nxus-core'

import Router from '../src'
import {router as routerProxy} from '../src'

describe("Router", () => {
  var router

  before(() => {
    sinon.spy(app, "once")
    sinon.spy(routerProxy, "respond")
    sinon.spy(routerProxy, "request")
  })
 
  beforeEach(() => {
    router = new Router(app);
  });
  
  describe("Load", () => {
    it("should not be null", () => Router.should.not.be.null)

    it("should be instantiated", () => {
      router = new Router(app);
      router.should.not.be.null;
    });
  });

  describe("Init", () => {
    it("should register for app lifecycle", () => {
      app.once.called.should.be.true;
      app.once.calledWith('launch').should.be.true;
      app.once.calledWith('stop').should.be.true;
    });

    it("should have port after load", () => {
      router.should.have.property('port');
      router.should.have.property('routeTable');
    });

    it("should register a handler for getExpressApp", () => {
      routerProxy.respond.calledWith('getExpressApp').should.be.true;
    })

    it("should register a handler for getRoutes", () => {
      routerProxy.respond.calledWith('getRoutes').should.be.true;
    })
    
    it("should register a handler for setStatic", () => {
      routerProxy.respond.calledWith('setStatic').should.be.true;
    })

    it("should register a handler for setRoute", () => {
      routerProxy.respond.calledWith('setRoute').should.be.true;
    })
  });

  describe("Providers", () => {
    it("should return an expressApp", () => {
      routerProxy.getExpressApp().then((expressapp) => {
        should.exist(expressapp)
        expressapp.should.have.property('use')
      })
    })

    it('should return the routing table', () => {
      routerProxy.route('get', '/somepath', () => {})
      routerProxy.getRoutes().then((routes) => {
        should.exist(routes)
        routes.length.should.be.above(0)
        routes[0].route.should.equal('/somepath')
      })
    })
  })
});
