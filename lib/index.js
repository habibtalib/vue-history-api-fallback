/**
* @Author: 周长安
* @Date:   2017-03-14 13:59:50
* @Email:  zchangan@163.com
* @Last modified by:   周长安
* @Last modified time: 2017-03-15 00:44:12
* @License: MIT
*/



const url = require('url');
const VueRouter = require('vue-router');
let Logger;

module.exports = function(options) {
  let defaultOptions = {
    router: null,
    index: '/index.html',
    redirect: [],
    logger: false,
    htmlAcceptHeaders: ['text/html', '*/*'],
    disableDotRule: false
  };
  options = Object.assign(defaultOptions, options);
  typeCheck(options);
  getLogger(options);

  let routerRedirect = [];
  parseRouter(options.router.routes, routerRedirect, options.index);
  options.redirect = options.redirect.concat(routerRedirect);

  return function(req, res, next) {
    if (filter(req, options))
      return next();
    let parsedUrl = url.parse(req.url);
    options.redirect.some(item => {
      if (tryFrom(item.from, parsedUrl.pathname)) {
        let to = getTo(item.to, parsedUrl) || options.index;
        Logger(`Redirct ${req.method} ${req.url} to ${to}`);
        req.url = to;
        return true;
      }
    });
    next();
  };
};

function typeCheck(options) {
  if (typeof options.logger !== 'boolean' && !(options.logger instanceof Function))
    throw new Error('[logger] must be Boolean || Function');

  if (typeof options.index !== 'string')
    throw new Error('[index] must be String');

  if (!(options.redirect instanceof Array))
    throw new Error('[redirect] must be Array');

  if (!(options.htmlAcceptHeaders instanceof Array))
    throw new Error('[htmlAcceptHeaders] must be Array');

  if (typeof options.disableDotRule !== 'boolean')
    throw new Error('[disableDotRule] must be Boolean');

  options.redirect.forEach(item => {
    if (typeof item.from !== 'string' && !(item.from instanceof RegExp)) {
      throw new Error('[from] must be String || RegExp');
    }
    if (typeof item.to !== 'undefined' && typeof item.to !== 'string' && !(item.to instanceof Function)) {
      throw new Error('[to] must be String || Function || undefined');
    }
  });

  if (!options.router || !(options.router instanceof Object))
    throw new Error('[router] must be VueRouter || Object');
  if (options.router instanceof VueRouter)
    options.router = options.router.options;

  if (options.router.mode !== 'history')
    throw new Error('[mode] of vue-router must be history');
}

function tryFrom(from, pathname) {
  if (from instanceof RegExp) {
    return from.test(pathname);
  } else {
    return from === pathname;
  }
}

function getTo(to, parsedUrl) {
  if (to instanceof Function) {
    return to(parsedUrl);
  } else return to;
}

function parseRouter(routes, routerRedirect, to, path='') {
  routes.forEach(item => {
    let from;
    if (item.path.startsWith('/')) {
      from = item.path;
    } else {
      from = path + '/' + item.path;
    }
    routerRedirect.push({from, to});
    if (item.children)
      parseRouter(item.children, routerRedirect, to, from);
  });
}

function filter(req, options) {
  let headers = req.headers;
  if (req.method !== 'GET') {
    Logger(`Ignore ${req.method} ${req.url} -- Not GET method`);
    return true;
  } else if (options.disableDotRule && url.parse(req.url).pathname.includes('.')) {
    Logger(`Ignore ${req.method} ${req.url} -- Includes a dot charactor`);
    return true;
  } else if (!headers || typeof headers.accept !== 'string') {
    Logger(`Ignore ${req.method} ${req.url} -- No HTTP accept header`);
    return true;
  } else if (headers.accept.startsWith('application/json')) {
    Logger(`Ignore ${req.method} ${req.url} -- Expect JSON instead of HTML`);
    return true;
  } else if (!acceptHTML(headers.accept, options.htmlAcceptHeaders)) {
    Logger(`Ignore ${req.method} ${req.url} -- Do not accept HTML`);
    return true;
  }
  return false;
}

function acceptHTML(acceptList, htmlAcceptHeaders) {
  return htmlAcceptHeaders.some(item => acceptList.includes(item));
}

function getLogger(options) {
  if (options.logger === true) {
    Logger = console.log;
  } else if (options.logger instanceof Function) {
    Logger = options.logger;
  } else {
    Logger = function(){};
  }
}
