/**
* @Author: 周长安
* @Date:   2017-03-14 14:00:09
* @Email:  zchangan@163.com
* @Last modified by:   周长安
* @Last modified time: 2017-03-15 00:45:57
* @License: MIT
*/



const history = require('../lib/index');
const expect = require('chai').expect;
const VueRouter = require('vue-router');

describe('Test Option Type', function() {
  it('[router] must be VueRouter || Object', function() {
    expect(()=>history())
    .to.throw('[router] must be VueRouter || Object');
  });

  it('[logger] must be Boolean || Function', function() {
    expect(()=>history({
      logger: ''
    })).to.throw('[logger] must be Boolean || Function');
  });

  it('[index] must be String', function() {
    expect(()=>history({
      index: false
    })).to.throw('[index] must be String');
  });

  it('[redirect] must be Array', function() {
    expect(()=>history({
      redirect: false
    })).to.throw('[redirect] must be Array');
  });

  it('[htmlAcceptHeaders] must be Array', function() {
    expect(()=>history({
      htmlAcceptHeaders: false
    })).to.throw('[htmlAcceptHeaders] must be Array');
  });

  it('[disableDotRule] must be Boolean', function() {
    expect(()=>history({
      disableDotRule: ''
    })).to.throw('[disableDotRule] must be Boolean');
  });

  it('[from] must be String || RegExp', function() {
    expect(()=>history({
      redirect: [{from: false}]
    })).to.throw('[from] must be String || RegExp');
  });

  it('[to] must be String || Function || undefined', function() {
    expect(()=>history({
      redirect: [{from:'', to: false}]
    })).to.throw('[to] must be String || Function || undefined');
  });

  it('[router] must be VueRouter || Object', function() {
    expect(()=>history({
      router: false
    })).to.throw('[router] must be VueRouter || Object');
  });

  it('[mode] of vue-router must be history', function() {
    expect(()=>history({
      router: {}
    })).to.throw('[mode] of vue-router must be history');
  });
});

describe('Test Router', function() {
  it('VueRouter Type', function() {
    history({
      router: new VueRouter({
        mode: 'history',
        routes: []
      })
    });
  });

  it('Object Type', function() {
    history({
      router: {
        mode: 'history',
        routes: []
      }
    });
  });

  it('Nest Routes', function() {
    history({
      router: {
        mode: 'history',
        routes: [
          {path: '/a'},
          {
            path: '/b',
            children: [{path: 'c'}]
          }
        ]
      }
    });
  });

  it('Redirct', function() {
    let redirctMiddleware = history({
      router: {
        mode: 'history',
        routes: [
          {path: '/f1'},
          {
            path: '/f2',
            children: [{path: 'c1'}]
          },
          {
            path: '/f3',
            children: [{path: '/c2'}]
          },
          {
            path: 'f4',
            children: [
              {
                path: '/c3',
                children: [{path: 'g'}]
              }
            ]
          },
        ]
      }
    });
    expect(redirectTest('/f1', redirctMiddleware)).to.true;
    expect(redirectTest('/f2', redirctMiddleware)).to.true;
    expect(redirectTest('/f3', redirctMiddleware)).to.true;
    expect(redirectTest('/f4', redirctMiddleware)).to.true;
    expect(redirectTest('/f2/c1', redirctMiddleware)).to.true;
    expect(redirectTest('/c2', redirctMiddleware)).to.true;
    expect(redirectTest('/c3/g', redirctMiddleware)).to.true;
    expect(redirectTest('anything else', redirctMiddleware)).to.false;
  });
  function redirectTest(url, middleware) {
    let req = {
      method: 'GET',
      headers: {
        accept: 'text/html'
      },
      url
    };
    middleware(req, undefined, ()=>{});
    return req.url === '/index.html';
  }
});

describe('Test Ignore', function() {
  let message = '';
  let logger = function(msg) {
    message = msg;
  };
  function ignoreTest(req) {
    let ignoreMiddleware = history({
      logger,
      router: {
        mode: 'history',
        routes: [{path: '/a'}]
      },
      disableDotRule: true
    });
    ignoreMiddleware(req, undefined, ()=>{});
  }

  it('Not GET method', function() {
    ignoreTest({
      method: 'POST'
    });
    expect(message).to.equal('Ignore POST undefined -- Not GET method');
  });

  it('Includes a dot charactor', function() {
    ignoreTest({
      method: 'GET',
      url: '/.a'
    });
    expect(message).to.equal('Ignore GET /.a -- Includes a dot charactor');
  });

  it('No HTTP accept header', function() {
    ignoreTest({
      method: 'GET',
      headers: {
        accept: false
      },
      url: '/a'
    });
    expect(message).to.equal('Ignore GET /a -- No HTTP accept header');
  });

  it('Expect JSON instead of HTML', function() {
    ignoreTest({
      method: 'GET',
      headers: {
        accept: 'application/json, text/html'
      },
      url: '/a'
    });
    expect(message).to.equal('Ignore GET /a -- Expect JSON instead of HTML');
  });

  it('Do not accept HTML', function() {
    ignoreTest({
      method: 'GET',
      headers: {
        accept: ''
      },
      url: '/a'
    });
    expect(message).to.equal('Ignore GET /a -- Do not accept HTML');
  });
});
