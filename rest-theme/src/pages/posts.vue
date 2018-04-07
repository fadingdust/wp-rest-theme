<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title">News</h1>

        <div class="posts-wrapper" v-if="(posts)">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (params.paged_index == page_index) }]"  v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: 'Blog-Paged', params: { 'paged_index': page_index }}">{{ page_index }}</router-link>
            </li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Config from '../app.config.js'
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';

    export default {

        components: {
          NotFound, Loading
        },

        data() {
            return {
                loading: true,
                error: false,
                posts: [],
                post_count: 0,
                page_count: 1,
                params: { paged_index: 1 }  //handy place to merge props & params
            }
        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          // react to route changes.. (for subcomponents/router-view)
          console.log("archive before update:", to, from, this);
          this.loading = true;
          this.posts= []; //clear for now

          //Basically the same as created()
          this.params = { ...this.params, ...to.params };

          this.getPosts();

          next(); // don't forget to call next()
        },

        created() {
            this.params = { ...this.params, ...this.$route.params };

            this.getPosts();
        },

        methods: {
            getPosts: function() {
                const wpPromisedResult = WordpressService.getPosts( this.params.paged_index, Config.posts_per_page );
                wpPromisedResult.then(result => {
                      console.log("PostSlug Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("PostSlug Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                      this.post_count = result.totalPosts;
                      this.page_count = Math.ceil( this.post_count / Config.posts_per_page);

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("PostSlug Error!", wpPromisedResult);
                  });
            }
        }
    }
</script>
