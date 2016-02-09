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
  });
  
  describe("Load", () => {
    it("should not be null", () => Router.should.not.be.null)

    it("should be instantiated", () => {
      router = new Router(app);
      router.should.not.be.null;
    });
  });
});