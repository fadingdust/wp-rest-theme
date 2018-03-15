<style>

</style>

<template>
    <div class="posts">
        <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
    </div>
</template>

<script>
    export default {
        props: ['term_slug', 'taxonomy_name'],

        data() {
            return {
                term: {},
                posts: []
            }
        },

        mounted() {

            let term_slug = this.term_slug;
            if(!term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

            this.getTermInfo(term_slug);
        },


        methods: {
            getTermInfo(term_slug){
                this.$http.get(wp.root + "wp/v2/"+this.taxonomy_name+"/?slug="+term_slug ).then(function(response) {
                    this.term = response.data[0];
                    this.$emit('page-title', '');

                    this.getPosts();
                }, function(response) {
                    console.log(response);
                });
            },
            getPosts() {
                this.$http.get(wp.root + "wp/v2/post/?"+this.taxonomy_name+"="+this.term.id ).then(function(response) {
                    this.posts = response.data;
                    this.$emit('page-title', '');
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }
</script>
