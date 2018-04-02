<style>

</style>

<template>
    <div class="posts author-archive">
        <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
    </div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        props: ['author_slug'],

        data() {
            return {
                loading: true,
                error: false,
                author: {},
                posts: []
            }
        },

        mounted() {
            let author_slug = this.author_slug;
            if ( !this.author_slug ) {
                author_slug = this.$route.params.author_slug;
            }
            this.getAuthor( author_slug );
        },

        methods: {

            getAuthor: function( author_slug ) {
                const wpPromisedResult = WordpressService.getAuthorInfo( author_slug )
                wpPromisedResult.then(result => {
                      console.log("getAuthor Found!", result.authors );
                      this.loading = false;

                      if( result.authors.length == 0 ) this.error = true;

                      let userIndex = 0;
                      for(userIndex in result.authors){
                        if(result.authors[userIndex].slug == author_slug){
                          this.author = result.authors[userIndex];
                          console.log("Found Author Data: ",this.author);
                          this.getPosts();
                        }
                      }

                  })
                  .catch(err => {
                    this.error = true;
                    console.log("getAuthor Error!", err, wpPromisedResult);
                  });

            },

            getPosts: function() {
                const wpPromisedResult = WordpressService.getAuthorPosts( this.author.id );
                wpPromisedResult.then(result => {
                      console.log("Author Posts Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("Author Posts Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("Author Posts Error!", wpPromisedResult);
                  });
            }

        }
    }
</script>
