<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(term_slug)">Search Results for &ldquo;{{ term_slug }}&rdquo;</h1>

        <div class="posts-wrapper search-archive">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)"></not-found>

            <Post v-for="post in posts" :post="post" :key="post.id"></Post>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index"><router-link :to="{ name: 'Search-Archive-Paged', params: { 'term_slug':term_slug, paged_index: page_index }}">{{ page_index }}</router-link></li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Config from '../app.config.js'
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import Post from './post.vue';

    export default {

        components: {
          NotFound, Loading, Post
        },

        props: ['term_slug'],

        data() {
            return {
                loading: true,
                error: false,
                posts: [],
                post_count: 0,
                page_count: 1,
                paged_index: 1
            }
        },

        mounted() {

            let term_slug = this.term_slug;
            if(!term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

            this.paged_index = (this.$route.params && this.$route.params.paged_index) ? this.$route.params.paged_index : 1;

            this.getPosts(term_slug);
        },

        methods: {
            getPosts: function(term_slug) {
                const wpPromisedResult = WordpressService.getSearchPosts( term_slug, this.paged_index, Config.posts_per_page );
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
