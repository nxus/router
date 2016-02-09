/* 
* @Author: Mike Reich
* @Date:   2015-11-06 17:10:00
* @Last Modified 2016-02-08
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
      app.once.calledWith('load').should.be.true;
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

    it("should register a handler for setAssets", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('setAssets').should.be.true;
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
});
