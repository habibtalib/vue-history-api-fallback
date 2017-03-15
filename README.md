# vue-history-api-fallback
![](https://travis-ci.org/Andiedie/vue-history-api-fallback.svg?branch=master) ![](https://david-dm.org/Andiedie/vue-history-api-fallback/status.svg) ![](https://david-dm.org/Andiedie/vue-history-api-fallback/dev-status.svg)


`Express` middleware to redirect requests to a specified index page according to your `vue-router` options, useful for Single Page Applications using the HTML5 History API.

[![NPM](https://nodei.co/npm/vue-history-api-fallback.png?downloads=true)](https://nodei.co/npm/vue-history-api-fallback/)

## Introduction

SPA using `history` mode makes the URL look more "normal" (or Beautiful).

However, without a proper server configuration, the users will get a `404` error if they access the router page directly in their browser.

To fix the issue, you can choose to use [connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback) that add a simple catch-all fallback route to your server.

However, there's another problem. Your server will no longer report 404 error as al not-found paths now serve up your `index.html` file.

This middleware is to solve the problem.

## Condition
This middleware will change the request url to a specified index page whenever the request meeting the following conditions:

1.  The method is `GET`
2.  The request accepts `text/html`
3.  `application/json` is not preferred
4.  The request url is one of the route in `vue-router` options


## Usage
### Install
```
npm install vue-history-api-fallback --save
```

### Use with express
```js
const express = require('express');
// import
const history = require('vue-history-api-fallback');
// get vue-router options
const options = require('./router.options.js');

let app = express();
app.use(history({options}));
```

## Options
### options.router
`requre`

The options of `vue-router`

It can be an instance of `VueRouter`
```js
const VueRouter = requre('vue-router');
let router = new VueRouter({
  mode: 'history',
  routes: [...]
});

history({router});
```

Or the options
```js
const VueRouter = requre('vue-router');
let options = {
  mode: 'history',
  routes: [...]
};
history({router});
let router = new VueRouter(options);
```

### options.index
default `/index.html`

The index page
```js
history({
  router,
  index: '/another.html'
});
```

### options.redirect
default `[]`

Redirct to index when the request url satisfy condition.

`from` can be `String` or `RegExp`

`to` can be `String`, `Function` or `undefined`(default `options.index`)
```js
history({
  router,
  redirect: [
    { from: /\/one/, to: '/one.html'},
    { from: '/two'},
    { from: '/three', to(parsedUrl) {
      return '/nav' + parsedUrl.pathname;
    }},
  ]
});
```

### options.logger
default `false`

Set this option to `true` if you want to print log
```js
history({
  router,
  logger: true
});
```

You can also use your own logger in this way
```js
function myLogger(msg) {
  console.log(`${new Date()} -- ${msg}`);
}

history({
  router,
  logger: myLogger
});
```

### options.htmlAcceptHeaders
default `['text/html', '*/*']`

If the `accept` in `headers` of a request contains anyone of this list, the middleware will think the request accept HTML.

```js
history({
  router,
  htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
});
```


### disableDotRule
default `false`

If the url contants a dot `.`, this middleware will ignore it because it's not a direct file request.

```js
history({
  router,
  disableDotRule: true
});
```
