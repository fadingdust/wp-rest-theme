<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(term)">{{ term.name }}</h1>
        <p class="archive-description" v-if="(term)">{{ term.description }}</p>

        <div :class="['posts-wrapper', {'content-loading': posts_loading, 'content-loaded':(!posts_loading) } ]">
            <loading v-if="(app_loading)" :loading="app_loading"></loading>
            <not-found v-if="(!app_loading && !posts_loading && posts.length == 0)"  :slug="term_slug"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!posts_loading && post_count > 0)">
          <p>Posts: {{ post_count }}</p>
          <p v-if="( page_count == 1)">All Posts Shown.</p>
          <ul v-if="( page_count > 1 && pagination_component_name )" class="posts-pagination list-inline">
            <li :class="[{ active: (params.paged_index == page_index) }]"   v-for="page_index in page_count" :key="page_index">
              <router-link :to="{ name: pagination_component_name, params: { term_slug: term.slug, paged_index: page_index }}">{{ page_index }}</router-link>
            </li>
          </ul>
        </div>

    </main>

</div>
</template>

<script>
    import Vuex from 'vuex';
    import Config from '../app.config.js'
    import Mixin from '../globals.js';
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import PostList from '../components/post-list.vue';


    export default {
        mixins: [Mixin],

        props: ['term_slug', 'taxonomy_name', 'post_types'],

        components: {
          NotFound, Loading, PostList
        },

        data() {
            return {
                app_loading: true,
                error: false,
                term: {},
                post_count: -1,
                pagination_component_name: 'Taxonomy-Category-Archive-Paged',
                params: { paged_index: 1, posts_per_page: Config.posts_per_page  }  //handy place to merge props & params
            }
        },

        computed: {
            ...Vuex.mapState(['posts_loading']),

            requested_type: function(){  // unify params & props..
              return 'post';
            },

            posts: function(){
              return this.$store.getters.getPostsByTerm(this.requested_type, this.params.taxonomy_name, this.term, this.params.paged_index, this.params.posts_per_page );
            },

            page_count: function(){
                return Math.ceil(this.post_count/this.params.posts_per_page);
            }

        },

        created() {

            this.params = { ...this.params, ...this.$props, ...this.$route.params }; // right-most wins

            this.pagination_component_name = (this.$route.name) ? this.$route.name : "Taxonomy-Category-Archive-Paged";
              this.pagination_component_name=this.pagination_component_name.replace("-UnPaged","");
              if( this.pagination_component_name.indexOf("-Paged") < 0) this.pagination_component_name=this.pagination_component_name+"-Paged"; //the pagination component will always be paged!

            this.updateHTMLTitle("Archive: "+this.params.term_slug);  //TODO: Use actual term name

            if(this.params.post_types.length==1 && typeof this.params.taxonomy_name == 'undefined'){
              this.getPostsByTerm('', '', this.params.paged_index);  // URI: /custom-post-type/

            }else{  // URI: /taxonomy-name/term-name/

              if( typeof this.params.term_slug !== "undefined" && this.params.post_types) this.getTermInfo(this.params.taxonomy_name, this.params.term_slug);
              else console.log( "Term Slug is undefined, no content will be loaded: ", this.params, this.$route.params, this.$props );

            }

        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          this.app_loading=false;

          //this.params = { ...this.$props, ...to.params };
          this.params = { ...this.params, ...this.$props, ...to.params };

          this.getPostsByTerm(this.params.taxonomy_name, this.term.id , to.params.paged_index); //implicit page_id

          next(); // don't forget to call next()
        },

        watch: {

          posts_loading: function(){
            this.app_loading=this.posts_loading;
          }

        },

        updated() {
            this.post_count = this.$store.getters.getArchivePostCount( 'taxonomy', this.params.taxonomy_name+"/"+this.params.term_slug );
        },

        methods: {

            getTermInfo: function(taxonomy_name, term_slug){

                const wpPromisedResult = WordpressService.getTermInfo( taxonomy_name, term_slug );
                wpPromisedResult.then(result => {
                      this.app_loading = false;

                      if( result.terms.length == 0 ) this.error = true;

                      this.term = result.terms[0];  //terrible plan?
                      if(this.term.count > 0) this.getPostsByTerm(this.taxonomy_name, this.term.id, this.params.paged_index);

                  })
                  .catch(err => {
                    this.error = true;
                    console.log("getTermInfo Error!", err, wpPromisedResult);
                  });

            }, // getTermInfo

            getPostsByTerm: function(taxonomy_name, term_id, page_index) {
              this.$store.dispatch('FETCH_TERM_POSTS', { 'term_object': this.term, ...this.params } );
            }  // getPostsByTerm

        }

    }
</script>
