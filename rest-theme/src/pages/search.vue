<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(params.term_slug)">Search Results for &ldquo;{{ params.term_slug }}&rdquo;</h1>

        <div :class="['posts-wrapper", "search-archive', {'content-loading': loading, 'content-loaded':(!loading) } ]">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)" :slug="term_slug"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: ( params.paged_index == page_index) }]" v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: 'Search-Archive-Paged', params: { 'term_slug': params.term_slug, paged_index: page_index }}">{{ page_index }}</router-link>
            </li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Config from '../app.config.js'
    import Mixin from '../globals.js';
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import Post from './post.vue';
    import PostList from '../components/post-list.vue';

    export default {
        mixins: [Mixin],

        components: {
          NotFound, Loading, Post, PostList
        },

        props: ['term_slug'],

        data() {
            return {
                loading: true,
                error: false,
                posts: [],
                post_count: 0,
                page_count: 1,
                params: { paged_index: 1, }
            }
        },

        // Option A: App-Level component gets fully-replaced: bad UX
        // Option B: here: manually swap data from incoming 'to' route
        // Option C: API.getAll -> PostList.posts.chunk(per_page, paged_index);

        beforeRouteUpdate (to, from, next) {
          // react to route changes.. (for subcomponents/router-view)
          this.loading = true;
          this.posts= []; //clear for now

          this.params = {  ...to.params, ...this.$props };

          this.getPosts( this.params.term_slug );

          next(); // don't forget to call next()
        },

        created() {
            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

              this.updateHTMLTitle("Search Results for "+this.params.term_slug);

            this.getPosts( this.params.term_slug);
        },

        methods: {
            getPosts: function(term_slug) {
                const wpPromisedResult = WordpressService.getSearchPosts( this.params.term_slug, this.params.paged_index, Config.posts_per_page );
                wpPromisedResult.then(result => {
                      console.log("Search Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("Search Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                      this.post_count = result.totalPosts;
                      this.page_count = Math.ceil( this.post_count / Config.posts_per_page);

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("Search Error!", wpPromisedResult);
                  });

            }
        }
    }
</script>
