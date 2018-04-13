<style>


</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title">News</h1>

        <div :class="['posts-wrapper', {'content-loading': posts_loading, 'content-loaded':(!posts_loading) } ]" v-if="(posts)">
            <loading v-if="(posts_loading)" :loading="posts_loading"></loading>
            <not-found v-if="(!posts_loading && posts.length == 0)" :slug="News"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!posts_loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (params.paged_index == page_index) }]"  v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: pagination_component_name, params: { 'paged_index': page_index }}">{{ page_index }}</router-link>
            </li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Vuex from 'vuex';
    import Config from '../app.config.js'
    import Mixin from '../globals.js';
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';

    export default {
        mixins: [Mixin],

        components: {
            NotFound, Loading
        },

        data() {
            return {
                app_loading: true,
                error: false,
                term: { id: -1 },
                post_count: -1,
                pagination_component_name: 'Blog-Paged',  //or Home-Paged
                params: { paged_index: 1, posts_per_page: Config.posts_per_page }  //handy place to merge props & params
            }
        },

        computed: {
            ...Vuex.mapState(['posts_loading']),

            requested_type: function(){  // unify params & props..
              return 'post';
            },

            posts: function(){
              return this.$store.getters.getPostsByTerm(this.requested_type, 'category', this.term, this.params.paged_index, this.params.posts_per_page );
            },

            page_count: function(){
                return Math.ceil(this.post_count/this.params.posts_per_page);
            }

        },

        watch: {

          posts_loading: function(){
            this.app_loading=this.posts_loading;
          }

        },

        created() {

            this.params = { ...this.params, ...this.$route.params }; // right-most wins

            this.pagination_component_name = (this.$route.name) ? this.$route.name : "Blog-Paged";
              this.pagination_component_name=this.pagination_component_name.replace("-UnPaged","");
              if( this.pagination_component_name.indexOf("-Paged") < 0) this.pagination_component_name=this.pagination_component_name+"-Paged"; //the pagination component will always be paged!

            this.fetchPosts();

            this.updateHTMLTitle("Archive: News");
        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.

            //Basically the same as created()
            this.params = { ...this.params, ...to.params };

            this.fetchPosts();

            this.updateHTMLTitle("Archive: News, Page "+this.params.paged_index);

            next(); // don't forget to call next()
        },

        updated() {
            this.post_count = this.$store.getters.getArchivePostCount( 'post_type', this.requested_type );
        },

        methods: {
            fetchPosts: function() {
              this.$store.dispatch('FETCH_POSTS', { post_type: this.requested_type, paged_index: this.params.paged_index, posts_per_page: this.params.posts_per_page } );
            }

        }//methods
    }

</script>
