/**
* @Author: 周长安
* @Date:   2017-03-14 13:59:50
* @Email:  zchangan@163.com
* @Last modified by:   周长安
* @Last modified time: 2017-03-14 19:47:05
*/

const url = require('url');
let logger;
const VueRouter = require('vue-router');
let defaultOptions = {
  router: null,
  index: '/index.html',
  redirect: [],
  logger: false,
  htmlAcceptHeaders: ['text/html', '*/*'],
  disableDotRule: false
};

module.exports = function(options) {
  options = Object.assign(defaultOptions, options);
  logger = getLogger(options);

  options.redirect.forEach(item => {
    if (typeof item.from !== 'string' && !(item.from instanceof RegExp)) {
      throw new Error('Option from must be a string or a regex');
    }
    if (item.to && typeof item.to !== 'string' && !(item.to instanceof Function)) {
      throw new Error('Option to must be a string , a Function or undefined');
    }
  });

  if (options.router) {
    if (!(options.router instanceof Object))
      throw new Error('Option router must be an instanceof VueRouter or Object');
    if (options.router instanceof VueRouter)
      options.router = options.router.options;

    if (options.router.mode !== 'history')
      throw new Error('The mode of vue-router must be history');
    let routerRedirect = [];
    parseRouter(options.router.routes, routerRedirect, options.index);
    options.redirect = options.redirect.concat(routerRedirect);
  }

  console.log(options.redirect);

  return function(req, res, next) {
    if (filter(req, options))
      return next();
    let parsedUrl = url.parse(req.url);
    options.redirect.some(item => {
      if (tryFrom(item.from, parsedUrl.pathname)) {
        let to = getTo(item.to, parsedUrl);
        logger(`Redirct ${req.method} ${req.url} to ${to}`);
        req.url = to;
        return true;
      }
    });
    next();
  };
};

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
    logger(`Ignore ${req.method} ${req.url} -- Not GET method`);
    return true;
  } else if (!headers || typeof headers.accept !== 'string') {
    logger(`Ignore ${req.method} ${req.url} -- No HTTP accept header`);
    return true;
  } else if (!acceptHTML(headers.accept, options.htmlAcceptHeaders)) {
    logger(`Ignore ${req.method} ${req.url} -- Do not accept HTML`);
    return true;
  } else if (headers.accept.startsWith('application/json')) {
    logger(`Ignore ${req.method} ${req.url} -- Expect JSON instead of HTML`);
    return true;
  }
  return false;
}

function acceptHTML(acceptList, htmlAcceptHeaders) {
  return htmlAcceptHeaders.some(item => acceptList.includes(item));
}

function getLogger(options) {
  if (options.logger === true) {
    return console.log.bind(console);
  } else if (options.logger) {
    return options.logger;
  } else {
    return function(){};
  }
}
