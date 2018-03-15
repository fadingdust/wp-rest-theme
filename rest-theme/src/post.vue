<style>

</style>

<template>
    <div class="post" v:if="singlePost.title">
        <h1 class="entry-title" v-if="isSingle">{{ singlePost.title.rendered }}</h1>
        <h2 class="entry-title" v-else><router-link :to="( base_path + singlePost.slug )">{{ singlePost.title.rendered }}</a></h2>

        <div class="entry-content" v-html="singlePost.content.rendered">
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            postId: {
              default(){ return 0; }
            },
            post: {
                type: Object
            }
        },

        data() {
            return {
                base_path: wp.base_path,
                isSingle: false,
                singlePost: {
                        id: 0,
                        slug: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                    }
            }
        },

        created() {
            if (this.postId > 0) {
                this.getPost(this.postId);
                this.isSingle = true;
            }else{  // Likely an Excerpt in an Archive
                this.singlePost = this.post;
            }

        },

        mounted() {
        },


        methods: {
            getPost(postId) {
                this.$http.get(wp.root + 'wp/v2/posts/' + postId).then(function(response) {
                    this.singlePost = response.data;
                    this.$emit('page-title', response.data.title.rendered);
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }
</script>
