<style>

</style>

<template>
<div class="page-wrapper">
    <main class="content">

        <loading v-if="(app_loading)" :loading="app_loading"></loading>
        <not-found v-if="(!posts_loading && error)" :slug="post_slug"></not-found>

        <article class="page" v-if="(page.id > 0)">
            <h1 class="entry-title">{{ page.title.rendered }}</h1>

            <div class="entry-content" v-html="page.content.rendered">
            </div>
        </article>
    </main>

</div>
</template>

<script>
    import Vuex from 'vuex';
    import Mixin from '../globals.js';
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';

    export default {
        mixins: [Mixin],

        components: {
          NotFound, Loading
        },

        props: ['post_slug'],

        data() {
            return {
                app_loading: true,
                error: false,
                params: { post_type: 'page' }
            }
        },

        computed: {
            ...Vuex.mapState(['posts_loading']),

            page: function(){
                const posts = this.$store.getters.getPost( this.params.post_type, this.params.post_slug);

                if(typeof posts[0] == 'undefined') return {id:-1}; //fake post
                else return posts[0];
            },

        },

        watch: {

          posts_loading: function(){
            this.app_loading=this.posts_loading;
            if( !this.posts_loading && this.page.id > 0 ) this.updateHTMLTitle(this.page.title.rendered);
            if( !this.posts_loading && this.page.id < 0 ) this.error=true;
          }

        },

        created: function() {

            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

            this.fetchPost( this.params.post_type, this.params.post_slug);

        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.

            this.params = { ...this.params,  ...to.params, ...this.$props };

            this.fetchPost( this.params.post_type, this.params.post_slug);

            next(); // don't forget to call next()
        },

        updated: function(){
            this.linkToRouterLink(); //must be called to make all inline-links into vue-friendly router-links
            this.$nextTick(function () { // Handy function for all children updates
              this.linkToRouterLink();

            });
        },

        methods: {

            fetchPost: function(post_type, post_slug) {
                this.$store.dispatch('FETCH_POST', this.params );
                this.app_loading = false;
            }

        }

    }
</script>
