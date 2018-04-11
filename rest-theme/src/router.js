import Vue from 'vue/dist/vue.js'

//Vue.use(require('vue-resource'));
import VueResource from 'vue-resource';
Vue.use(VueResource);

import VueRouter from 'vue-router'
Vue.use(VueRouter);

Vue.config.debug = true

import FrontPage from './pages/front-page.vue';
Vue.component('FrontPage', FrontPage);

import Blog from './pages/blog.vue';
Vue.component('Blog', Blog);

import Page from './pages/page.vue';
Vue.component('Page', Page);

import Archive from './pages/archive.vue';
Vue.component('Archive', Archive);

import ArchiveDate from './pages/archive-date.vue';
Vue.component('ArchiveDate', ArchiveDate);

import Author from './pages/author.vue';
Vue.component('Author', Author);

import Search from './pages/search.vue';
Vue.component('Search', Search);

import Post from './pages/post.vue'; //Single
Vue.component('Post', Post);

import PostList from './components/post-list.vue';
Vue.component('PostList', PostList);


var router = new VueRouter({
  mode: 'history',
  base: wp.base_path,
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 };  // scroll to top on-router-link click
  }
});

// Convert the Routes made in PHP/Wordpress into actual Component Objects
for (var key in wp.routes) {
    let route = wp.routes[key];
    let component_name = route.component;
    wp.routes[key].component = Vue.component( component_name );

    if( wp.routes[key].children && wp.routes[key].children.length > 0){
      for (var child_key in wp.routes[key].children) {
        let child_component_name = wp.routes[key].children[child_key].component;
        wp.routes[key].children[child_key].component = null;
        wp.routes[key].children[child_key].components = { "post-list": Vue.component( child_component_name ) };
      }
    }
    if( typeof(wp.routes[key].component) == "undefined" ) console.log("Developer: Please create component named " + component_name );
}
router.addRoutes( wp.routes );

export default router;
