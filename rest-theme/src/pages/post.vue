<style>
article footer{
  border-top: 1px solid #ddd;
}

.entry-meta>p{
  display:inline-block;
  margin: 10px 10px 0 0;
}

article img{
  max-width: 100%;
  height: auto;
}
</style>

<template>
<div class="page-wrapper">
    <main class="content">

        <div :class="['posts-wrapper', {'content-loading': posts_loading, 'content-loaded':(!posts_loading) } ]">
            <loading v-if="(app_loading && isSingle)" :loading="app_loading"></loading>
            <not-found v-if="(!posts_loading && posts.length == 0)" :slug="post_slug"></not-found>

            <!-- likely should use a separate component for post-content & post-excerpt -->
            <transition name="fade" appear>
              <router-view name="post-list" :isSingle="isSingle" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

    </main>

</div>
</template>

<script>
    import Vuex from 'vuex';
    import Mixin from '../globals.js';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import PostList from '../components/post-list.vue';

    export default {
        mixins: [Mixin],

        components:{
          PostList, NotFound, Loading
        },

        props: {
            post_slug: { type: String },
            post_type: { type: String },
        },

        data: function() {
            return {
                app_loading: true,
                error: false,
                base_path: wp.base_path,
                isSingle: true,
                params: { post_type: 'post' }
            }
        },

        computed: {
            ...Vuex.mapState(['posts_loading']),

            posts: function(){
                return this.$store.getters.getPost( this.params.post_type, this.params.post_slug);
            },

        },

        watch: {

          posts_loading: function(){
            this.app_loading=this.posts_loading;
            if( !this.posts_loading && this.posts.length > 0 ) this.updateHTMLTitle(this.posts[0].title.rendered);
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

        methods: {
            fetchPost: function(post_type, post_slug) {
                this.$store.dispatch('FETCH_POST', this.params );
                this.app_loading = false;
            }

        }//methods

    }
</script>
