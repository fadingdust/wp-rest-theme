<style>

</style>

<template>
    <div class="post" >
        <h1 class="entry-title" v-if="isSingle">{{ singlePost.title.rendered }}</h1>
        <h2 class="entry-title" v-else><router-link :to="( singlePost.permalink_path )">{{ singlePost.title.rendered }}</router-link></h2>

        <div class="entry-content" v-html="singlePost.content.rendered">
        </div>
    </div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        props: {
            post_slug: { type: String },
            post_type: { type: String },
            post: {
                type: Object,
                default() {
                    return {
                        id: 0,
                        permalink_path: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                    }
                }
            }
        },

        data: function() {
            return {
                loading: true,
                error: false,
                base_path: wp.base_path,
                isSingle: false,
                singlePost: {
                        id: 0,
                        permalink_path: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                }
            }
        },

        created: function() {
            if (!this.post.id) {
                let post_type = this.post_type;
                if (!this.post_type) post_type = 'post';

                let post_slug = this.post_slug;
                if (!this.post_slug) post_slug = this.$route.params.post_slug;

                this.getPost(post_type, post_slug);
                this.isSingle = true;

            }else{  // Likely an Excerpt in an Archive
                this.singlePost = this.post;
            }

        },

        methods: {
            getPost: function(post_type, post_slug) {
                const wpPromisedResult = WordpressService.getPostBySlug( post_type, post_slug );
                wpPromisedResult.then(result => {
                      console.log("PostSlug Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("PostSlug Found, no data");
                      }else{
                          this.singlePost = result.posts[0];
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
