<style>

</style>

<template>
    <div class="posts">
        <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
    </div>
</template>

<script>
    export default {
        props: ['term_slug', 'taxonomy_name', 'post_types'],

        data() {
            return {
                term: {},
                posts: []
            }
        },

        mounted() {

            if(this.post_types.length==1) this.getPostsByTerm('', '');  // URI: /custom-post-type/
            else{  // URI: /taxonomy-name/term-name/
              let term_slug = this.term_slug;
              if(!term_slug && this.$route.params.term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

              if(term_slug && this.post_types) this.getTermInfo(term_slug);
            }

        },

        methods: {
            getTermInfo: function(term_slug){
                this.$http.get(wp.root + "wp/v2/"+this.taxonomy_name+"/?slug="+term_slug ).then(function(response) {
                    this.term = response.data[0];
                    this.$emit('page-title', '');

                    if(this.term.count > 0) this.getPostsByTerm(this.taxonomy_name, this.term.id);

                }, function(response) {
                    console.log(response);
                });
            },
            getPostsByTerm: function(taxonomy_name, term_id) {
                let query = "";
                if(taxonomy_name && term_id) query = "?"+taxonomy_name+"="+term_id;

                for(post_type_index in this.post_types){  //1 Term can be applied to multiple post_types. I'd prefer a single API query
                  this.getPosts(this.post_types[post_type_index], query);
                }
            },
            getPosts: function(post_type, query) {
                this.$http.get(wp.root + "wp/v2/"+post_type+"/" + query ).then(function(response) {
                    if( response.data.length > 0 ){
                      let middle_man = this.posts;
                      this.posts = middle_man.concat(response.data);  //concat directly on posts didn't run an update?!
                      this.$emit('page-title', '');

                    }

                }, function(response) {
                    console.log(response);
                });
            }

        }

    }
</script>
