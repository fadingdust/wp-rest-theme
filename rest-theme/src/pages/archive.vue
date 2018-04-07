<style>

</style>

<template>
<div class="page-wrapper">

    <main class="content">
        <h1 class="page-title" v-if="(term)">{{ term.name }}</h1>
        <p class="archive-description" v-if="(term)">{{ term.description }}</p>

        <div class="posts-wrapper">
            <loading v-if="(loading)"></loading>
            <not-found v-if="(!loading && posts.length == 0)"></not-found>

            <transition name="fade" appear>
              <router-view name="post-list" :posts="posts" :key="this.$route.fullPath"></router-view>
            </transition>
        </div>

        <div class="pagination" v-if="(!loading && post_count > 0)">
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
    import Config from '../app.config.js'
    import WordpressService from '../services/wordpress';

    import NotFound from '../components/not-found.vue';
    import Loading from '../components/loading.vue';
    import PostList from '../components/post-list.vue';

    export default {
        props: ['term_slug', 'taxonomy_name', 'post_types'],

        components: {
          NotFound, Loading, PostList
        },

        data() {
            return {
                loading: true,
                error: false,
                term: {},
                posts: [],
                post_count: 0,
                page_count: 1,
                pagination_component_name: 'Taxonomy-Category-Archive-Paged',
                params: { paged_index: 1 }  //handy place to merge props & params
            }
        },

        beforeRouteUpdate (to, from, next) {  // Option A: App-Level component gets fully-replaced; Option B: here: manually swap data.
          // react to route changes.. (for subcomponents/router-view)
          console.log("archive before update:", to, from, this);
          this.loading = true;

          this.params = { ...to.params, ...this.$props };

          this.getPostsByTerm(this.taxonomy_name, this.term.id , to.params.paged_index); //implicit page_id

          next(); // don't forget to call next()
        },

        created() {
            this.params = { ...this.params, ...this.$route.params, ...this.$props };

            this.pagination_component_name = (this.$route.name) ? this.$route.name : "Taxonomy-Category-Archive-Paged";
              this.pagination_component_name=this.pagination_component_name.replace("-UnPaged","");
              if( this.pagination_component_name.indexOf("-Paged") < 0) this.pagination_component_name=this.pagination_component_name+"-Paged"; //the pagination component will always be paged!


            if(this.post_types.length==1 && typeof this.taxonomy_name == 'undefined'){
              this.getPostsByTerm('', '', this.params.paged_index);  // URI: /custom-post-type/

            }else{  // URI: /taxonomy-name/term-name/
              this.params.term_slug = this.term_slug;
              if(!this.params.term_slug && this.$route.params.term_slug) this.params.term_slug = this.$route.params.term_slug;  // sometimes the prop isn't set on path-routes

              if(this.params.term_slug && this.post_types) this.getTermInfo(this.taxonomy_name, this.params.term_slug);

            }

        },

        methods: {

            getTermInfo: function(taxonomy_name, term_slug){

                const wpPromisedResult = WordpressService.getTermInfo( taxonomy_name, term_slug );
                wpPromisedResult.then(result => {
                      this.loading = false;

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
                this.loading = true;
                let post_type_index = 0;
                this.posts= []; //clear for now
                for(post_type_index in this.post_types){

                    const wpPromisedResult = WordpressService.getTermPosts( this.post_types[post_type_index], taxonomy_name, term_id, page_index, Config.posts_per_page);
                    wpPromisedResult.then(result => {
                        this.post_count = result.totalPosts;
                        this.page_count = Math.ceil( this.post_count / Config.posts_per_page);

                        this.loading = false;

                        if( result.posts.length == 0 ) this.error = true;

                        let middle_man = this.posts;
                        this.posts = middle_man.concat(result.posts);  //concat directly on posts does not update: https://vuejs.org/v2/guide/list.html#Caveats
                        this.posts = result.posts;

                        console.log("getPostsByTerm Result:", result);

                    })
                    .catch(err => {
                      this.error = true;
                      console.log("getPostsByTerm Error!", err, wpPromisedResult);
                    });

                }//for

            }// getPostsByTerm


        }

    }
</script>
