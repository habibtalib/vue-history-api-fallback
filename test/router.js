/**
* @Author: 周长安
* @Date:   2017-03-14 17:12:26
* @Email:  zchangan@163.com
* @Last modified by:   周长安
* @Last modified time: 2017-03-14 17:30:12
* @License: MIT
*/

const VueRouter = require('vue-router');
const Foo = { template: '<div>foo</div>' };

module.exports = new VueRouter({
  mode: 'history',
  // base: __dirname,
  routes: [{
    //routes for main entrance
    name: 'login_register',
    path: '/login_register',
    component: Foo
  }, {
    //routes for users' apply system
    name: 'nav',
    path: '/nav',
    component: Foo,
    children: [{
      name: 'apply',
      path: 'apply',
      component: Foo
    }, {
      name: 'check',
      path: 'check',
      component: Foo
    }, {
      name: 'result',
      path: 'result',
      component: Foo
    }, {
      name: 'modify',
      path: 'modify',
      component: Foo
    }]
  }, {
    //routes for the front-desk mangement system
    name: 'front-desk',
    path: '/front_desk_management',
    component: Foo
  }, {
    //routes for the super-admin management system
    name: 'super-admin',
    path:'/super_admin_navigation',
    component: Foo,
    children: [{
      name: 'longterm',
      path: 'longterm',
      component: Foo
    }, {
      name: 'management',
      path: 'management',
      component: Foo
    }, {
      name: 'arrange',
      path: 'arrange',
      component: Foo
    }]
  }]
});
