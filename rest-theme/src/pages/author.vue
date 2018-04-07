<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(author)">Posts by {{ author.name }}</h1>
        <p class="archive-description" v-if="(author)">{{ author.description }}</p>

        <div class="posts-wrapper author-archive">
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
            <li :class="[{ active: (params.paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: 'Author-Archive-Paged', params: { 'author_slug': author.slug , 'paged_index': page_index }}">{{ page_index }}</router-link>
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
    import PostList from '../components/post-list.vue';

    export default {
        props: ['author_slug'],

        components: {
          NotFound, Loading, PostList
        },

        data() {
            return {
                loading: true,
                error: false,
                author: {},
                posts: [],
                post_count: 0,
                page_count: 1,
                pagination_slug: '',
                params: { paged_index: 1 }  //handy place to merge props & params
            }
        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          // react to route changes.. (for subcomponents/router-view)
          console.log("archive before update:", to, from, this);
          this.loading = true;
          this.posts= []; //clear for now

          this.params = {  ...to.params, ...this.$props };

          this.getAuthor( this.params.author_slug );

          next(); // don't forget to call next()
        },

        created() {
            this.params = { ...this.params, ...this.$route.params, ...this.$props };

            this.getAuthor( this.params.author_slug );
        },

        methods: {

            getAuthor: function( author_slug ) {
                const wpPromisedResult = WordpressService.getAuthorInfo( author_slug )
                wpPromisedResult.then(result => {
                      console.log("getAuthor Found!", result.authors );
                      this.loading = false;

                      if( result.authors.length == 0 ) this.error = true;

                      let userIndex = 0;
                      for(userIndex in result.authors){
                        if(result.authors[userIndex].slug == author_slug){
                          this.author = result.authors[userIndex];
                          console.log("Found Author Data: ",this.author);
                          this.getPosts();
                        }
                      }

                  })
                  .catch(err => {
                    this.error = true;
                    console.log("getAuthor Error!", err, wpPromisedResult);
                  });

            },

            getPosts: function() {
                this.loading = true;

                const wpPromisedResult = WordpressService.getAuthorPosts( this.author.id , this.params.paged_index, Config.posts_per_page);
                wpPromisedResult.then(result => {
                      console.log("Author Posts Found!", result);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("Author Posts Found, no data");
                      }else{
                          this.posts = result.posts;
                      }

                      this.post_count = result.totalPosts;
                      this.page_count = Math.ceil( this.post_count / Config.posts_per_page);

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("Author Posts Error!", wpPromisedResult);
                  });
            }

        }
    }
</script>
