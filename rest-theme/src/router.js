import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'

Vue.use(require('vue-resource'));
Vue.use(VueRouter);

Vue.config.debug = true

import Posts from './pages/posts.vue';
const Home = Vue.component('Home', Posts);
Vue.component('Blog', Posts);

import Archive from './pages/archive.vue';
Vue.component('Archive', Archive);

import ArchiveDate from './pages/archive-date.vue';
Vue.component('ArchiveDate', ArchiveDate);

import Author from './pages/author.vue';
Vue.component('Author', Author);

import Search from './pages/search.vue';
Vue.component('Search', Search);

import Post from './pages/post.vue';
Vue.component('Post', Post);

import Page from './pages/page.vue';
Vue.component('Page', Page);


var router = new VueRouter({
  mode: 'history'
});

router.addRoutes([ {
    path: wp.base_path,
    component: Home
}]);

// Convert the Routes made in PHP/Wordpress into actual Component Objects
for (var key in wp.routes) {
    var route = wp.routes[key];
    wp.routes[key].component = Vue.component( route.component );
}
router.addRoutes( wp.routes );

export default router;
