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
                this.$http.get(wp.root + 'wp/v2/'+post_type+'/?slug=' + post_slug).then(function(response) {

                    if( response.data.length == 0 ){
                      this.singlePost.title.rendered = "Not Found";
                      this.singlePost.content.rendered = "We could not find anything that matched this request.";

                    } else {
                      this.singlePost = response.data[0];
                      this.$emit('page-title', response.data[0].title.rendered);
                    }

                }, function(response) {
                    console.log(response);
                });
            }
        }

    }
</script>
