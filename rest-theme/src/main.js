import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'

Vue.use(require('vue-resource'));
Vue.use(VueRouter);

Vue.config.debug = true

import Posts from './posts.vue'
import Post from './post.vue'
Vue.component('Post', Post)
import Page from './page.vue'
Vue.component('Page', Page)
import Header from './theme-header.vue'
Vue.component('theme-header', Header)
import Footer from './theme-footer.vue'
Vue.component('theme-footer', Footer)

var router = new VueRouter({
  mode: 'history'
});

router.addRoutes([ {
    path: wp.base_path,
    component: Posts
}]);

for (var key in wp.routes) {
    var route = wp.routes[key];
    router.addRoutes([ {
        path: wp.base_path + route.slug,
        component: Vue.component(capitalize(route.type)),
        props: {default: true, postId: route.id}
    }]);
}

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
