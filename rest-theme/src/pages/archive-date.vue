<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(this.year)">Posts from {{monthTitle}} </h1>

        <div class="posts" v-if="(posts)">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)"></not-found>

            <Post v-for="post in posts" :post="post" :key="post.id"></Post>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index"><router-link :to="{ name: pagination_component_name, params: { paged_index: page_index, 'year': year, 'month': month }}">{{ page_index }}</router-link></li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Config from '../app.config.js'
    import WordpressService from '../services/wordpress';
    import moment from "moment";


    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';

    export default {
        props: ['year','month'],

        components: {
          NotFound, Loading
        },

        computed:{
          monthTitle: function(){
            let dateString="";
            if( this.year!=="" && this.month) dateString = moment(this.year+"-"+this.month+"-"+1).format("MMMM YYYY");
            else if( this.year!==""  && !this.month) dateString = moment(this.year+"-1-1").format("YYYY");
            return dateString;
          }
        },

        data() {
            return {
                loading: true,
                error: false,
                order: 'desc',
                posts: [],
                post_count: 0,
                page_count: 1,
                paged_index: 1,
                pagination_component_name: 'Month-Archive-Paged'
            }
        },

        mounted() {
            this.paged_index = (this.$route.params && this.$route.params.paged_index) ? this.$route.params.paged_index : 1;

            this.pagination_component_name = (this.$route.name) ? this.$route.name : "Month-Archive-Paged";
            if( this.pagination_component_name.indexOf("-Paged") < 0) this.pagination_component_name=this.pagination_component_name+"-Paged"; //the pagination component will always be paged!

            this.getPosts();
        },

        methods: {
            getPosts: function() {
                const wpPromisedResult = WordpressService.getMonthPosts( this.year, this.month, this.paged_index, Config.posts_per_page, this.order );
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
