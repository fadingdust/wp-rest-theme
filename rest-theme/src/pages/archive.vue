<style>

</style>

<template>
    <div class="posts">
        <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
    </div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        props: ['term_slug', 'taxonomy_name', 'post_types'],

        data() {
            return {
                loading: true,
                error: false,
                term: {},
                posts: []
            }
        },

        mounted() {

            if(this.post_types.length==1 && typeof this.taxonomy_name == 'undefined'){
              this.getPostsByTerm('', '');  // URI: /custom-post-type/

            }else{  // URI: /taxonomy-name/term-name/
              let term_slug = this.term_slug;
              if(!term_slug && this.$route.params.term_slug) term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

              if(term_slug && this.post_types) this.getTermInfo(this.taxonomy_name, term_slug);

            }

        },

        methods: {
            getTermInfo: function(taxonomy_name, term_slug){

                const wpPromisedResult = WordpressService.getTermInfo( taxonomy_name, term_slug );
                wpPromisedResult.then(result => {
                      this.loading = false;

                      if( result.terms.length == 0 ) this.error = true;

                      this.term = result.terms[0];  //terrible plan?
                      if(this.term.count > 0) this.getPostsByTerm(this.taxonomy_name, this.term.id);

                  })
                  .catch(err => {
                    this.error = true;
                    console.log("getTermInfo Error!", wpPromisedResult);
                  });

            }, // getTermInfo

            getPostsByTerm: function(taxonomy_name, term_id) {
                let post_type_index = 0;
                for(post_type_index in this.post_types){

                    const wpPromisedResult = WordpressService.getTermPosts( this.post_types[post_type_index], taxonomy_name, term_id);
                    wpPromisedResult.then(result => {
                          this.loading = false;

                          if( result.posts.length == 0 ) this.error = true;

                          let middle_man = this.posts;
                          this.posts = middle_man.concat(result.posts);  //concat directly on posts does not update: https://vuejs.org/v2/guide/list.html#Caveats

                      })
                      .catch(err => {
                        this.error = true;
                        console.log("getPostsByTerm Error!", err, wpPromisedResult);
                      });

                }//for

            }// getPostsByTerm


        }

    }
</script>
