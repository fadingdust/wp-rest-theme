<style>

</style>

<template>
    <div class="posts ">
        <Post v-for="post in posts" :post="post" :key="post.id"></Post>
    </div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        props: ['year','month'],
        mounted() {
            this.getPosts();
        },

        data() {
            return {
                loading: true,
                error: false,
                page: 1,
                perPage: 10,
                order: 'desc',
                posts: []
            }
        },

        methods: {
            getPosts: function() {
                const wpPromisedResult = WordpressService.getMonthPosts( this.year, this.month, this.page, this.perPage, this.order );
                wpPromisedResult.then(result => {
                      console.log("PostSlug Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("PostSlug Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("PostSlug Error!", wpPromisedResult);
                  });
            }
        }
    }
</script>
