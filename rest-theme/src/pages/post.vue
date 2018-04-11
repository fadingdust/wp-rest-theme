<style>
article footer{
  border-top: 1px solid #ddd;
}

.entry-meta>p{
  display:inline-block;
  margin: 10px 10px 0 0;
}

article img{
  max-width: 100%;
  height: auto;
}
</style>

<template>
<div class="page-wrapper">
    <main class="content">

        <div :class="['posts-wrapper', {'content-loading': loading, 'content-loaded':(!loading) } ]">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)" :slug="post_slug"></not-found>

            <!-- likely should use a separate component for post-content & post-excerpt -->
            <transition name="fade" appear>
              <router-view name="post-list" :isSingle="isSingle" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

    </main>

</div>
</template>

<script>
    import Mixin from '../globals.js';
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import PostList from '../components/post-list.vue';

    export default {
        mixins: [Mixin],

        components:{
          PostList, NotFound, Loading
        },

        props: {
            post_slug: { type: String },
            post_type: { type: String },
        },

        data: function() {
            return {
                loading: true,
                error: false,
                base_path: wp.base_path,
                isSingle: true,
                params: { post_type: 'post' },
                posts: []
            }
        },

        created: function() {

            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

            this.getPost( this.params.post_type, this.params.post_slug);

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
                          this.posts = result.posts;

                          this.updateHTMLTitle(this.posts[0].title.rendered);
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
