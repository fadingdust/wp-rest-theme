import Vue from 'vue/dist/vue.js'

import router from './router.js'

import Footer from './components/theme-footer.vue';
Vue.component('theme-footer', Footer);

var App = new Vue({
    el: '#app',
    router: router,

    template: '<div id="app-root">' +
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

///////////////////////////////////////////////////////////////////////
//  Fix the static nav <a> links to be <router-link>.
///////////////////////////////////////////////////////////////////////
jQuery( "a[href^='"+wp.basePath+"'], a[href^='/']:not([href*='#'])"  ).on("click", function(event){
    event.preventDefault();
    var linkPath = jQuery(this).attr("href").replace(wp.siteurl,'');
    var resolvedRoute = router.resolve(linkPath);

    $(".site-header li").removeClass('current-menu-item');
    $(this).parent("li").addClass('current-menu-item');


    console.log('clicked', wp.base_path, linkPath,  resolvedRoute);
    router.replace( resolvedRoute.route );
}); // click


