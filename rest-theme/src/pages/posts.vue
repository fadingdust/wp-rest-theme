<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title">News</h1>

        <div class="posts-wrapper">
            <Post v-for="post in posts" :post="post" :key="post.id"></Post>
        </div>
    </main>

</div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        data() {
            return {
                loading: true,
                error: false,
                posts: []
            }
        },

        mounted() {
            this.getPosts();
        },

        methods: {
            getPosts: function() {
                const wpPromisedResult = WordpressService.getPosts();
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
