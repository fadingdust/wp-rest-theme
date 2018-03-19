import Vue from 'vue/dist/vue.js'

import router from './router.js';


import Header from './components/theme-header.vue';
Vue.component('theme-header', Header);

import Footer from './components/theme-footer.vue';
Vue.component('theme-footer', Footer);


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

    updated: function(){

        this.$nextTick(function () {
            // Handy function for when all children

        });
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

