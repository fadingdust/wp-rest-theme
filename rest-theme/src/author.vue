<style>

</style>

<template>
    <div class="posts author-archive">
        <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
    </div>
</template>

<script>
    export default {
//        props: ['author_slug'],

        data() {
            return {
                author: {},
                posts: []
            }
        },

        mounted() {
            this.getAuthor();
        },

        methods: {

            getAuthor() {
                this.$http.get(wp.root + "wp/v2/users/?username="+this.$route.params.author_slug).then(function(response) {
                  for(userIndex in response.data){
                    if(response.data[userIndex].slug == this.$route.params.author_slug){
                      this.author = response.data[userIndex];
                      this.getPosts();
                    }
                  }
                    this.$emit('page-title', '');

                }, function(response) {
                    console.log(response);
                });
            },

            getPosts() {
                this.$http.get(wp.root + "wp/v2/post/?author="+this.author.id).then(function(response) {
                    this.posts = response.data;
                    this.$emit('page-title', '');
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }
</script>
