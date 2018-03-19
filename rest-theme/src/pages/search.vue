<style>

</style>

<template>
    <div class="posts search-archive">
        <Post v-for="post in posts" :post="post" :key="post.id"></Post>
    </div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    import Post from './post.vue';

    export default {
        props: ['term_slug'],

        data() {
            return {
                loading: true,
                error: false,
                posts: []
            }
        },

        components: { 'Post': Post },

        mounted() {

            let term_slug = this.term_slug;
            if(!term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

            this.getPosts(term_slug);
        },

        methods: {
            getPosts: function(term_slug) {
                const wpPromisedResult = WordpressService.getSearchPosts( term_slug );
                wpPromisedResult.then(result => {
                      console.log("Search Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("Search Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("Search Error!", wpPromisedResult);
                  });

            }
        }
    }
</script>
