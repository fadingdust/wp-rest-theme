<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(this.year)">Posts from {{monthTitle}} </h1>

        <div :class="['posts-wrapper', {'content-loading': posts_loading, 'content-loaded':(!posts_loading) } ]">
            <loading v-if="(posts_loading)" :loading="posts_loading"></loading>
            <not-found v-if="(!posts_loading && posts.length == 0)" :slug="monthTitle"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :post_count="post_count" :page_index="params.paged_index"  :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!posts_loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count  > 1)" class="posts-pagination list-inline">
            <li :class="[{ active: (params.paged_index == page_index) }]"  v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: pagination_component_name, params: { paged_index: page_index, 'year': year, 'month': month }}">{{ page_index }}</router-link>
            </li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Config from '../app.config.js'
    import Vuex from 'vuex';
    import Mixin from '../globals.js';
    import moment from "moment";

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import PostList from '../components/post-list.vue';

    export default {
        mixins: [Mixin],

        components: {
          NotFound, Loading, PostList
        },

        props: ['year','month'],

        data() {
            return {
                app_loading: true,
                error: false,
                order: 'desc',
                post_count: -1,
                pagination_component_name: 'Month-Archive-Paged',
                params: { paged_index: 1 }  //handy place to merge props & params
            }
        },

        computed:{
            ...Vuex.mapState(['posts_loading']),

            monthTitle: function(){
              let dateString="";
              if( this.params.year!=="" && this.params.month) dateString = moment(this.params.year+"-"+this.params.month+"-"+1).format("MMMM YYYY");
              else if( this.params.year!=="" && !this.params.month) dateString = moment(this.params.year+"-1-1").format("YYYY");
              return dateString;
            },

            requested_post_types : function(){
                let post_types = this.params.post_types;
                if (!this.params.post_types) post_types = ['post'];
                return post_types;
            },

            posts: function(){
                return this.$store.getters.getPostsByMonth( this.params.year, this.params.month, this.params.paged_index);
            },

            page_count: function(){
                return Math.ceil(this.post_count/Config.posts_per_page);
            }

        },

        watch: {

          posts_loading: function(){ //what about when it pulls from the store? no posts are loading then :/
            this.app_loading=this.posts_loading;
          }

        },

        created() {
            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

            this.pagination_component_name = (this.$route.name) ? this.$route.name : "Month-Archive-Paged";
            this.pagination_component_name = this.pagination_component_name.replace("-UnPaged","");
            if( this.pagination_component_name.indexOf("-Paged") < 0) this.pagination_component_name=this.pagination_component_name+"-Paged"; //the pagination component will always be paged!

            this.fetchPosts();
        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          this.app_loading=false;

          this.params = { ...to.params, ...this.$props };

          this.fetchPosts(); //implicit page_id

          next(); // don't forget to call next()
        },

        updated() {
          this.app_loading=false;
          this.post_count = this.$store.getters.getArchivePostCount( 'month', this.params.year+"/"+this.params.month );
        },

        mounted() {
            this.updateHTMLTitle("Archive: "+this.monthTitle);
        },

        methods: {
            fetchPosts: function() {
                this.$store.dispatch('FETCH_MONTH_POSTS', { year: this.params.year, month: this.params.month, paged_index: this.params.paged_index, posts_per_page: Config.posts_per_page, order: this.order  } );
            }
        }
    }
</script>
