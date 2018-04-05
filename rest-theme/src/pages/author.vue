<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(author)">Posts by {{ author.name }}</h1>

        <div class="posts author-archive">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)"></not-found>

            <Post v-for="post in posts" :post="post" :key="post.id" v-if="post"></Post>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index"><router-link :to="{ name: 'Author-Archive-Paged', params: { 'author_slug': author.slug , 'paged_index': page_index }}">{{ page_index }}</router-link></li>
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
        props: ['author_slug'],

        components: {
          NotFound, Loading
        },

        data() {
            return {
                loading: true,
                error: false,
                author: {},
                posts: [],
                post_count: 0,
                page_count: 1,
                paged_index: 1
            }
        },

        created() {
            this.paged_index = (this.$route.params && this.$route.params.paged_index) ? this.$route.params.paged_index : 1;

            let author_slug = this.author_slug;
            if ( !this.author_slug ) {
                author_slug = this.$route.params.author_slug;
            }
            this.getAuthor( author_slug );
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

                const wpPromisedResult = WordpressService.getAuthorPosts( this.author.id , this.paged_index, Config.posts_per_page);
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
