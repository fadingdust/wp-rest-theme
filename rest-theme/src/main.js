import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'

Vue.use(require('vue-resource'));
Vue.use(VueRouter);

Vue.config.debug = true

import Posts from './posts.vue';
const Home = Vue.component('Home', Posts);
Vue.component('Blog', Posts);

import Archive from './archive.vue';
Vue.component('Archive', Archive);

import ArchiveDate from './archive-date.vue';
Vue.component('ArchiveDate', ArchiveDate);

import Author from './author.vue';
Vue.component('Author', Author);

import Search from './search.vue';
Vue.component('Search', Search);

import Post from './post.vue';
Vue.component('Post', Post);

import Page from './page.vue';
Vue.component('Page', Page);

import Header from './theme-header.vue';
Vue.component('theme-header', Header);

import Footer from './theme-footer.vue';
Vue.component('theme-footer', Footer);


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

var App = new Vue({
    el: '#app',
    router: router,
    template: '<div id="app-root"><theme-header></theme-header>' +
              '<div class="container"><router-view :key="this.$route.fullPath"></router-view></div>' +
              '<theme-footer></theme-footer></div>',

    mounted() {
        this.updateTitle('');
    },

    methods: {
        updateTitle(pageTitle) {
            document.title = (pageTitle ? pageTitle + ' - ' : '') + wp.site_name;
        }
    },

    events: {
        'page-title': function(pageTitle) {
            this.updateTitle(pageTitle);
        }
    }
});

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
