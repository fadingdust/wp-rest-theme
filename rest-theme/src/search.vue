<style>

</style>

<template>
    <div class="posts search-archive">
        <Post v-for="post in posts" :post="post" :key="post.id"></Post>
    </div>
</template>

<script>
    export default {
        props: ['term_slug'],

        data() {
            return {
                posts: []
            }
        },

        mounted() {

            let term_slug = this.term_slug;
            if(!term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

            this.getPosts(term_slug);
        },

        methods: {
            getPosts(term_slug) {
                this.$http.get(wp.root + "wp/v2/post/?search="+term_slug).then(function(response) {
                    this.posts = response.data;
                    this.$emit('page-title', '');
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }
</script>
