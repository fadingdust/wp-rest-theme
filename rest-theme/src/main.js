import Vue from 'vue/dist/vue.js'

import VueResource from 'vue-resource';
Vue.use(VueResource);

import router from './router.js'

import Footer from './components/theme-footer.vue';
Vue.component('theme-footer', Footer);


import Mixin from './globals.js';


/**
 * Note: App-Root Template loads in Google-Bot
 */

//var App =
new Vue({
    el: '#app',
    router: router,
// :key="this.$route.fullPath"
    template: '<div id="app-root">' +
              '<div class="container"><transition name="parent-fade" mode="out-in" appear><router-view :key="unpagedPath"></router-view></transition></div>' +
              '<theme-footer></theme-footer></div>',

    mounted() {
    },

    methods: {

    },

    computed: {

        unpagedPath: function(){  //Vue-Router tends to prefer non-trailing slashes.
          //Use as router-view key for parent-routes (so parent router-views do not get updated on child router-views
          let path = this.$route.fullPath;
          if( path.substring(path.length -1, path.length) == '/') path = path.substring(0, path.length-1) //trim trailing slash
          let pagedIndex = path.indexOf('/page/');
          if(pagedIndex > -1 ) path = path.substring(0, pagedIndex);  // blog-home = '/'

          return path;
        }

    },

    updated: function(){

        this.$nextTick(function () { // Handy function for all children updates
            // Watch for any links pulled in from WP articles, etc.
            jQuery( "a[href^='"+wp.base_path+"'], a[href^='/']:not([href*='#'])"  ).on("click", function(event){
                event.preventDefault();

              //Decide which route:
                var linkPath = ( jQuery(this).attr("href").indexOf(wp.base_url) > -1) ? jQuery(this).attr("href").replace(wp.base_url,'/') : jQuery(this).attr("href").replace(wp.base_path,'/');

              // Actually change the path now:
                router.replace( linkPath );
            });

        });
    },

});



///////////////////////////////////////////////////////////////////////
//  Fix the static nav <a> links to be <router-link>.
///////////////////////////////////////////////////////////////////////

jQuery( "a[href^='"+wp.base_path+"'], a[href^='/']:not([href*='#'])"  ).on("click", function(event){
    event.preventDefault();

  //Decide which route:
    var linkPath = ( jQuery(this).attr("href").indexOf(wp.base_url) > -1) ? jQuery(this).attr("href").replace(wp.base_url,'/') : jQuery(this).attr("href").replace(wp.base_path,'/');

  // Actually change the path now:
    router.replace( linkPath ); //resolvedRoute.route.fullPath );

  //UI Stuff:
    jQuery(".site-header .navbar-collapse").collapse('hide');  //hide the nav.
    jQuery(".site-header li").removeClass('current-menu-item');
    jQuery(this).parent("li").addClass('current-menu-item');

}); // click



