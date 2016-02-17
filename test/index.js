/* 
* @Author: Mike Reich
* @Date:   2015-11-06 17:10:00
* @Last Modified 2016-02-17
*/

'use strict';

import Router from '../src/'

import TestApp from '@nxus/core/lib/test/support/TestApp';

describe("Router", () => {
  var router;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
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
      return app.emit('load').then(() => {
        router.should.have.property('port');
        router.should.have.property('routeTable');
      });
    });

    it("should register a gather for routes", () => {
      return app.emit('load').then(() => {
        app.get.calledWith('router').should.be.true;
        app.get().gather.calledWith('route').should.be.true;
      });
    })

    it("should register a handler for getExpressApp", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('getExpressApp').should.be.true;
      });
    })

    it("should register a handler for setStatic", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('setStatic').should.be.true;
      });
    })

    it("should register a handler for setRoute", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('setRoute').should.be.true;
      });
    })

    it("should register a handler for setRoute.get", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('setRoute.get').should.be.true;
      });
    })

    it("should register a handler for setRoute.post", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('setRoute.post').should.be.true;
      });
    })    
  });

  describe("Providers", () => {
    it("should return an expressApp", () => {
      app.emit('load').then(() => {
        app.get('router').use(router)
        app.get('router').request('getExpressApp', (expressapp) => {
          should.exist(expressapp)
          expressapp.should.have.property('use')
        })
      })
    })

    it('should return the routing table', () => {
      app.emit('load').then(() => {
        app.get('router').use(router)
        app.get('router').provide('route', 'get', '/somepath', () => {})
        app.get('router').request('getRoutes', (routes) => {
          should.exist(routes)
          routes.length.should.be.above(0)
          routes[0].route.should.equal('/somepath')
        })
      })
    })
  })
});
