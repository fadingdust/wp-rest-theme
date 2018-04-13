<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(author)">Posts by {{ author.name }}</h1>
        <p class="archive-description" v-if="(author)">{{ author.description }}</p>

        <div :class="['posts-wrapper', 'author-archive', {'content-loading': posts_loading, 'content-loaded':(!posts_loading) } ]">
            <loading v-if="(posts_loading)" :loading="posts_loading"></loading>
            <not-found v-if="(!app_loading && !posts_loading && posts.length == 0)" :slug="author_slug"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!posts_loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (params.paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: 'Author-Archive-Paged', params: { 'author_slug': author.slug , 'paged_index': page_index }}">{{ page_index }}</router-link>
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
    import PostList from '../components/post-list.vue';

    export default {
        mixins: [Mixin],

        props: ['author_slug'],

        components: {
          NotFound, Loading, PostList
        },

        data() {
            return {
                app_loading: true,
                error: false,
                author: {},
                pagination_slug: '',
                params: { paged_index: 1, posts_per_page: Config.posts_per_page}  //handy place to merge props & params
            }
        },

        computed: {
            ...Vuex.mapState(['posts_loading']),

            requested_type: function(){  // unify params & props..
              return 'post';
            },

            posts: function(){
              return this.$store.getters.getPostsByAuthorSlug(this.author.slug, this.params.paged_index, this.params.posts_per_page );
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

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          this.app_loading=false;

            this.params = { ...this.params,  ...to.params, ...this.$props };

            this.getAuthor( this.params.author_slug );

            next(); // don't forget to call next()
        },

        created() {
            this.app_loading = true;

            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

            this.getAuthor( this.params.author_slug );

            this.updateHTMLTitle("Archive: "+this.params.author_slug); //TODO: Use actual author name

        },

        updated() {
            this.post_count = this.$store.getters.getArchivePostCount( 'author', this.params.author_slug );
        },

        methods: {

            getAuthor: function( author_slug ) {
                const wpPromisedResult = WordpressService.getAuthorInfo( author_slug )
                wpPromisedResult.then(result => {
                      console.log("getAuthor Found!", result.authors );
                      this.app_loading = false;

                      if( result.authors.length == 0 ) this.error = true;

                      let userIndex = 0;
                      for(userIndex in result.authors){
                        if(result.authors[userIndex].slug == author_slug){
                          this.author = result.authors[userIndex];
                          console.log("Found Author Data: ",this.author);
                          this.fetchPosts();
                        }
                      }

                  })
                  .catch(err => {
                    this.app_loading = false;
                    this.error = true;
                    console.log("getAuthor Error!", err, wpPromisedResult);
                  });

            },

            fetchPosts: function() {
                this.$store.dispatch('FETCH_AUTHOR_POSTS', { author: this.author, ...this.params, order: this.order } );
            }

        }//methods
    }
</script>
