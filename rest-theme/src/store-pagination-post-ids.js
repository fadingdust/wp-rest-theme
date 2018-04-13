import Vue from 'vue/dist/vue.js'
import Vuex from 'vuex'
Vue.use(Vuex);


import Config from './app.config.js'

import WordpressService from './services/wordpress'

import _ from 'lodash'

//const _ = require('lodash');

/**
 *  Basic list-get functions:
    * addUniquely // lodash.uniq
    * getByPage(page_size, page_index)  //lodash.chunk
    * sortBy()... then getByPage()  // lodash.sortedUniqBy
    * filterBy(has term(s), author, date > ..)  // lodash.filter
    * findFirstByObject = lodash.findIndex
 *
 */
function array_unique_objects( all_pages ) {
  return all_pages.filter(
    function(obj, pos, arr) {
      return arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos;
    }
    );
}
function array_unique_posts( all_pages ) {
  return all_pages.filter(
    function(obj, pos, arr) {
      return arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos;
    }
    );
}
function array_unique_terms( all_terms ) {
  return all_terms.filter(
    function(obj, pos, arr) {
      return arr.map(mapObj => mapObj.term_id).indexOf(obj.term_id) === pos;
    }
    );
}


// Sync Initial State:
var initialPosts = [];
var initialTerms = [];
var initialAuthors = [];

if( window.wpapi ){
  if( typeof window.wpapi.posts !== "undefined") initialPosts = window.wpapi.posts;
  if( typeof window.wpapi.terms !== "undefined") initialTerms = window.wpapi.terms;
  if( typeof window.wpapi.authors !== "undefined") initialAuthors = window.wpapi.authors;
}

const store = new Vuex.Store({
    state: {
      posts: initialPosts,  //should this be an object with index = postID?
      terms: initialTerms,  //could be entirely possible to treat 'authors' as a cat/post-type. year/month not so much.
      authors: initialAuthors,
      posts_loading: false,
      terms_loading: false,
      authors_loading: false,
      archive_post_counts: { 'blog': {}, 'author': {}, 'month': {} }, // blog??  // no way to keep track of if all of a month's posts are available/loaded except straight from API response.
          // should these actually be post-slug/id indicies to track where they are in pagination??

    //moving the first of these 3 into Config as per_page_api..
      posts_per_request: 10,
      terms_per_request: 100,
      author_per_request: 100,

    },

    mutations: {  // synchronous
      SET_POSTS_LOADING: (state, loading) => {
          state.posts_loading = loading;
      },
      SET_TERMS_LOADING: (state, loading) => {
          state.terms_loading = loading;
      },
      SET_AUTHORS_LOADING: (state, loading) => {
          state.authors_loading = loading;
      },
      SET_ARCHIVE_COUNTS: (state,  archive_count ) => {   // { 'type':'author', 'author_id': author_id, 'count':response.totalPosts }
          let tmp = state.archive_post_counts;
          tmp[ archive_count.type ][ archive_count.slug ] = { 'count': archive_count.count }; //non-reactive update method :/
          state.archive_post_counts = tmp;
      },
      STORE_POSTS: (state,  new_posts ) => {
          let all_pages = [ ...state.posts, ...new_posts.posts ];

          if( all_pages.length > 0) state.posts = array_unique_objects( all_pages );

console.log("STORE_POSTS",  state.posts, all_pages, new_posts);
           state.posts_loading = false; // no commit function avail

      },
      STORE_TERMS: (state,  new_terms ) => {
          let all_terms = [ ...state.terms, ...new_terms.terms ];

          if( all_terms.length > 0) state.terms = array_unique_objects( all_terms );

console.log("STORE_TERMS:",  state.terms, all_terms);
           state.terms_loading = false; // no commit function avail

      },
      STORE_AUTHORS: (state,  new_authors ) => {
          let all_authors = [ ...state.authors, ...new_authors.authors ];

          if( all_authors.length > 0) state.authors = array_unique_objects( all_authors );

console.log("STORE_AUTHORS:",  state.authors, all_authors);
           state.authors_loading = false; // no commit function avail

      }

    }, //mutations

    actions: {  //async
      FETCH_POST ({ commit }, get_object ) {
        commit('SET_POSTS_LOADING', true);

        const found_post = this.getters.getPost( get_object.post_type, get_object.post_slug );

console.log("FETCH_POST - started", get_object, found_post);

        if( typeof found_post[0] !== 'undefined' ){ //if it found something that matches..
            commit('SET_POSTS_LOADING', false);

        }else { //no matches, hit the API
            WordpressService.getPostBySlug( get_object.post_type, get_object.post_slug ).then((response) => {
              if( response.posts.length == 0 ){
                // OPTIONAL: Handle 404s here, and return a fake post to avoid hitting the server over & over.
                // response.posts = [{ title: { rendered: "Not Found!"}, type: get_object.type, slug: get_object.slug}];
              }
              commit('STORE_POSTS', { posts: response.posts });

            }, err => { // seems to be rare in normal circumstances.
              console.log("FETCH_POST: err:",err, get_object );
              commit('SET_POSTS_LOADING', false);
            });
        }

      },
      FETCH_POSTS ({ commit }, get_object ) {
        //the first activity for this becomes getting the post-type id-list of posts, then chunking it.

        //after that, it JS maps posts by ID

        //only then do we know which posts are missing, and if we need to get them from the API.

        return new Promise((resolve, reject) => {
    console.log("FETCH_POSTS - started", get_object);
            get_object.paged_index=parseInt(get_object.paged_index);
            get_object.posts_per_page=parseInt(get_object.posts_per_page);

            const found_posts = this.getters.getPosts(get_object.post_type, get_object.taxonomy,  get_object.term_id, get_object.paged_index, -1 );
            const total_post_count = this.getters.getArchivePostCount('blog', get_object.post_type);  // get_object.year+"/"+get_object.month

            if( total_post_count > -1 && (found_posts.length >= (get_object.paged_index*Config.posts_per_page) || found_posts.length >= total_post_count)){

                // no need to get the same posts..
                  commit('SET_POSTS_LOADING', false);
                  resolve({ raw: found_posts});
            }else {
    console.log("FETCH_POSTS - found_posts.length: ", found_posts.length,  get_object.paged_index, Config.posts_per_page, total_post_count  );
                //Convert UI pagination to API pagination:

                const apiPostIndex = get_object.paged_index * get_object.posts_per_page;
                const apiPageIndex = apiPostIndex/Config.posts_per_page_api;

                let apiPostsPerPage = Config.posts_per_page_api;

                if( Math.floor(apiPageIndex) !== Math.ceil(apiPageIndex) ){
                  apiPostsPerPage+=get_object.posts_per_page; // ensure we get a full set for the UI pages
                }

                commit('SET_POSTS_LOADING', true);
                WordpressService.getPosts(get_object.post_type,  Math.ceil(apiPageIndex) , apiPostsPerPage).then((response) => {
                  resolve({ raw: response});
                  if( response.totalPosts > -1) commit('SET_ARCHIVE_COUNTS', { type: 'blog', slug: get_object.post_type, count: response.totalPosts });

                  commit('STORE_POSTS', { posts: response.posts });

                }, err => { // seems to be rare in normal circumstances.
                  reject({ raw: err});
                  commit('SET_POSTS_LOADING', false);
                });
            }
        }); // return Promise
      },

      FETCH_TERM_POSTS ({ commit }, get_object ) {
        return new Promise((resolve, reject) => {
            get_object.paged_index=parseInt(get_object.paged_index);

            let found_posts = this.getters.getPosts(get_object.post_type, get_object.taxonomy, get_object.term_object.id, get_object.paged_index, Config.posts_per_page_api );

console.log("FETCH_TERM_POSTS: ", found_posts.length, get_object.term_object.count , ( get_object.paged_index*Config.posts_per_page_api ) );

            if( found_posts.length == get_object.term_object.count || found_posts.length >= get_object.paged_index*Config.posts_per_page_api ){
                // no need to get the same posts..
                  commit('SET_POSTS_LOADING', false);
                  resolve({ raw: found_posts});
            }else {
                commit('SET_POSTS_LOADING', true);
                WordpressService.getTermPosts( get_object.type, get_object.taxonomy,  get_object.term_object.id ).then((response) => {
                  console.log("FETCH_TERM_POSTS: Service.getTermPosts: ", response);
                  resolve({ raw: response});
                  commit('STORE_POSTS', { posts: response.posts });

                }, err => { // seems to be rare in normal circumstances.
                  console.log("FETCH_TERM_POSTS: err:",err, get_object );
                  reject({ raw: err});
                  commit('SET_POSTS_LOADING', false);
                });
            }
        }); // return Promise
      },

      FETCH_MONTH_POSTS ({ commit }, get_object ) {   // get_object.year, get_object.month, get_object.paged_index
        return new Promise((resolve, reject) => {
console.log("FETCH_MONTH_POSTS - started", get_object);
            get_object.paged_index=parseInt(get_object.paged_index);

            const found_posts = this.getters.getPostsByMonth(get_object.year, get_object.month, -1); //pagination < 0 = get all  // get_object.paged_index
            const total_month_post_count = this.getters.getArchivePostCount('month', get_object.year+"/"+get_object.month);

            if( total_month_post_count > -1 && found_posts.length >= total_month_post_count){   // (get_object.paged_index*Config.posts_per_page_api)
                // All posts from the API. No need to get the same posts..
                  commit('SET_POSTS_LOADING', false);
                  resolve({ raw: found_posts});

            }else{ //Ideally, no pagination will happen in here:

/*
{ year: this.params.year, month: this.params.month, paged_index: this.params.paged_index, posts_per_page: Config.posts_per_page_api, order: this.order  } );

                WordpressService.getMonthPosts( this.params.year, this.params.month, this.params.paged_index, Config.posts_per_page_api, this.order );
*/
                //pagination index is off
                //Convert UI pagination to API pagination:

                const apiPostIndex = parseInt(get_object.paged_index) * get_object.posts_per_page;
                const apiPageIndex = apiPostIndex/Config.posts_per_page_api;

                let apiPostsPerPage = Config.posts_per_page_api;

                if( Math.floor(apiPageIndex) !== Math.ceil(apiPageIndex) ){
                  apiPostsPerPage+=get_object.posts_per_page; // ensure we get a full set for the UI pages
                }



                commit('SET_POSTS_LOADING', true);
                WordpressService.getMonthPosts( get_object.year, get_object.month, apiPageIndex, apiPostsPerPage, get_object.order ).then((response) => {

                  if( response.totalPosts > -1) commit('SET_ARCHIVE_COUNTS', { type: 'month', slug: get_object.year+"/"+get_object.month, count: response.totalPosts });
//                      commit('SET_ARCHIVE_COUNTS', { page_count:  Math.ceil( response.totalPosts / Config.posts_per_page_api) });

                  commit('STORE_POSTS', { posts: response.posts });
                  resolve({ raw: response});

                }, err => { // seems to be rare in normal circumstances.
                  console.log("FETCH_MONTH_POSTS: err:",err, get_object );
                  reject({ raw: err});

                  commit('SET_POSTS_LOADING', false);
                });

            }
        }); // return Promise
      },
      FETCH_AUTHOR_POSTS ({ commit }, get_object ) {   // get_object.year, get_object.month, get_object.paged_index
        return new Promise((resolve, reject) => {
console.log("FETCH_AUTHOR_POSTS - started", get_object);
            get_object.paged_index=parseInt(get_object.paged_index);

            if( get_object.hasOwnProperty('author')  ){

              const getPerRequest = this.getters.getPerRequest();
              const found_posts = this.getters.getPostsByAuthorID( get_object.author.id, get_object.paged_index , Config.posts_per_page_api );

              if( typeof get_object.author.id == 'undefined' || found_posts.length >= (get_object.paged_index*Config.posts_per_page_api) ){
                  // no need to get the same posts..
                    commit('SET_POSTS_LOADING', false);
                    commit('SET_ARCHIVE_COUNTS', { 'type':'author', 'slug': get_object.author.slug, 'count': found_posts.length }); // temporary, in case 10+ posts have been cached.
                    resolve({ raw: found_posts});
              }else {

                  commit('SET_POSTS_LOADING', true);
                  WordpressService.getAuthorPosts( get_object.author.id,  get_object.paged_index, Config.posts_per_page_api ).then((response) => {
                    commit('STORE_POSTS', { posts: response.posts });
                    commit('SET_ARCHIVE_COUNTS', { 'type':'author', 'slug': get_object.author.slug, 'count':response.totalPosts });
console.log("FETCH_AUTHOR_POSTS: raw:",response );
                    resolve({ raw: response});

                  }, err => { // seems to be rare in normal circumstances.
                    console.log("FETCH_AUTHOR_POSTS: err:",err, get_object );
                    reject({ raw: err});

                    commit('SET_POSTS_LOADING', false);
                  });
              }
            }
        }); // return Promise
      },
      FETCH_TERMS ({ commit }, get_object ) { // .taxonomy_name, .term_slug
        return new Promise((resolve, reject) => {
            get_object.paged_index=parseInt(get_object.paged_index);

console.log("FETCH_TERMS - started", get_object);
            let found_terms = this.getters.getTerms(get_object.taxonomy_name, get_object.term_slug ); //make sure we have the one we want..

            const getPerRequest = this.getters.getPerRequest();

            if( found_terms.length > 0){
                // no need to get the same posts..
                  commit('SET_TERMS_LOADING', false);
                  resolve({ raw: found_terms });

            }else {

                  commit('SET_TERMS_LOADING', true);
                  WordpressService.getTaxTerms( get_object.taxonomy_name , getPerRequest.terms  ).then(response => {  // might as well get all of 'em! //, get_object.term_slug
                      resolve({ raw: response });
                      console.log("FETCH_TERMS:", get_object, response);
                      commit('STORE_TERMS', { terms: response.terms }); //always return an array - sanity

                  })
                  .catch(err => {
                    console.log("FETCH_TERMS: err:", err, get_object );
                    reject({ raw: err });

                    commit('SET_TERMS_LOADING', false);

                  });

            } //if
            }); // return Promise
      },// fetch_term
      FETCH_AUTHORS ({ commit }, get_object ) { // .taxonomy_name, .term_slug
        return new Promise((resolve, reject) => {
console.log("FETCH_AUTHORS - started", get_object);
            get_object.paged_index=parseInt(get_object.paged_index);
            let found_authors = this.getters.getAuthorBySlug( get_object.author_slug ); //make sure we have the one we want..


            if( found_authors.length > 0){
                // no need to get the same posts..
                  commit('SET_AUTHORS_LOADING', false);
                  resolve({ raw: found_authors });
            }else {
                  commit('SET_AUTHORS_LOADING', true);
                  WordpressService.getAuthorInfo( get_object.author_slug  ).then(response => {  // might as well get all of 'em! //, get_object.term_slug

                      commit('STORE_AUTHORS', { authors: response.authors }); //always return an array - sanity
                      resolve({ raw: response });
                      // tempting to fetch_author_posts too

                  })
                  .catch(err => {
                    console.log("FETCH_AUTHORS: err:", err, get_object );
                    commit('SET_AUTHORS_LOADING', false);
                    reject({ raw: err });

                  });

            }
        }); // return Promise
      }// fetch_authors

    },
    getters: {
      getPost: (state) => (requested_type, requested_slug) => {
        let found_post;

        if( state.posts.length > 0){
          found_post = state.posts.find(post => ( post.type == requested_type && post.slug === requested_slug));
        }

        return [found_post];
      },

      getPosts: (state) => (requested_types, requested_taxonomy, requested_term_id, paged_index, posts_per_page) => {  //handle pagination!
        let found_posts = [];
        if( state.posts.length > 0 ){

          found_posts = state.posts.reduce(
              function(accumulator, currentPost) {
                let safe_to_add = false;

                // Real Posts Only (NOTE: if using a 404 post with id < 1, then disable this..
                if( parseInt(currentPost.id) > 0  ) safe_to_add = true;
                else safe_to_add = false; //implied

                // Any post type, or the requested post types
                if( typeof requested_types == 'undefined' ) safe_to_add = true;
                else if( requested_types.indexOf(currentPost.type) > -1 ) safe_to_add = true;
                else safe_to_add = false;

                // If a tax & term are requested, then ensure post is in it.
                if( parseInt(requested_term_id) > 0 && currentPost.hasOwnProperty(requested_taxonomy)){
                   if( currentPost[requested_taxonomy].indexOf(requested_term_id) > -1 ) safe_to_add = true;
                   else safe_to_add = false;
                }

                if( safe_to_add ) accumulator.push( currentPost );

                return accumulator;
              },
              [] // do i preload these with prior page empties?
            );
        }
        console.log("Store.getPosts", requested_types, requested_taxonomy, parseInt(requested_term_id),  state.posts, found_posts);

        /**
         *  Major Problem: entering on /page/12+
         *  The API query will get api_page_2 (10 posts)
         *  The chunking will look for chunks of 10 and not get the second chunk.
         *  Q: Do I need to do chunk-offsetting?
         *
         *  What if a user clicks on api-page-4 and then api-page-2?
         *  4: 10 posts + 0 preceding = offset 4=0
         *  2: 10 posts + 10 preceding = offset 0 (really offset 1!)
         *
         *  Add attributes? :page_id=?  post-sort-index=50?
         *
         *  group by page?
         *
         */

        if(paged_index > 0 && posts_per_page > -1){ // posts_per_page>-1 == a way to return all found-posts
          const paged_posts = _.chunk(found_posts, Config.posts_per_page);
          found_posts = paged_posts[ paged_index - 1];
      console.log("Store.getPosts paged:", paged_index, Config.posts_per_page, state.posts, paged_posts, found_posts);
        }

        return found_posts;
      },

      getPostsByMonth: (state) => (requested_year, requested_month, paged_index) => {  //handle pagination!

          let found_posts = [];
          if( state.posts.length > 0 ){
              found_posts = state.posts.reduce(
                  function(accumulator, currentPost) {
                    if(currentPost.date_archive && currentPost.id > 0 ){ // && slug?? requested_term_id
                        if( currentPost.date_archive.year ==  requested_year && currentPost.date_archive.month ==  requested_month ){
                             accumulator.push( currentPost );
                        }
                    }
                      return accumulator;
                  },
                  []
                );
          }

          if(paged_index > 0){
            const paged_posts = _.chunk(found_posts, Config.posts_per_page);
            found_posts = paged_posts[ paged_index - 1];
          }


        console.log("Store.getPostsByMonth", requested_year, requested_month, state.posts, found_posts);
        return found_posts;
      },

      getPostsByAuthorID: (state) => ( requested_author_id, paged_index) => {  //handle pagination!

        let found_posts = [];
        if( state.posts.length > 0 ){
        found_posts = state.posts.reduce(
                            function(accumulator, currentPost) {
                              if( currentPost.author > 0 && currentPost.id > 0 ){ // && slug?? requested_term_id
                                  if( currentPost.author == requested_author_id ){
                                       accumulator.push( currentPost );
                                  }
                              }
                              return accumulator;
                            },
                            []
                          );
        }

        console.log("Store.getPostsByAuthorID", requested_author_id, state.posts, found_posts);
        return found_posts;
      },

      getPostsByAuthorSlug: (state) => ( requested_author_slug, paged_index) => {  //handle pagination!

        let found_posts = [];
        if( state.posts.length > 0 ){
        found_posts = state.posts.reduce(
                            function(accumulator, currentPost) {
                              if( currentPost.author_object && currentPost.id > 0 ){ // && slug?? requested_term_id
                                  if( currentPost.author_object.slug == requested_author_slug ){
                                       accumulator.push( currentPost );
                                  }
                              }
                              return accumulator;
                            },
                            []
                          );
        }

        console.log("Store.getPostsByAuthorSlug", requested_author_slug, state.posts, found_posts);
        return found_posts;
      },

      getSearchPosts: (state) => ( requested_term, paged_index) => {  //now i'm making my own search engine?!

        let found_posts = [];
        if( state.posts.length > 0 && typeof requested_term !== 'undefined'){
        found_posts = state.posts.reduce(
                            function(accumulator, currentPost) {
                              if( currentPost.content.rendered.indexOf(requested_term) > -1 && currentPost.id > 0 ){ // this is a phrase-search for now
                                accumulator.push( currentPost );
                              }
                              return accumulator;
                            },
                            []
                          );
        }

        console.log("Store.getSearchPosts", requested_term, state.posts, found_posts);
        return found_posts;
      },

      getTerms: (state) => ( requested_taxonomy_name, requested_term_slug ) => {

        let found_term = [];
        if( state.terms.length > 0 ){
        found_term = state.terms.reduce(
                            function(accumulator, currentTerm) {
                              if(currentTerm.taxonomy == requested_taxonomy_name && currentTerm.slug == requested_term_slug ){
                                accumulator.push( currentTerm );
                              }
                                return accumulator;
                            },
                            []
                          );
        }

        console.log("Store.getTerm", requested_taxonomy_name, requested_term_slug,  state.terms, found_term);
        return found_term;
      }, // getTerms

      getAuthorBySlug: (state) => ( requested_author_slug ) => {
        let found_author = [];
        if( state.authors.length > 0 ){
        found_author = state.authors.reduce(
                            function(accumulator, currentAuthor) {
                              if( currentAuthor.slug == requested_author_slug ){
                                accumulator.push( currentAuthor );
                              }
                                return accumulator;
                            },
                            []
                          );
        }

        console.log("Store.getAuthorBySlug", requested_author_slug,  state.authors, found_author);
        return found_author;
      }, // getAuthorBySlug

      getArchivePostCount: (state) => ( requested_archive_type, requested_archive_slug ) => {
          let post_count = -1;
//  !state.posts_loading &&
          if(state.archive_post_counts[ requested_archive_type ].hasOwnProperty( requested_archive_slug ) ) post_count = state.archive_post_counts[ requested_archive_type ][ requested_archive_slug ].count;
 console.log("getArchivePostCount: ", requested_archive_type, requested_archive_slug, state.archive_post_counts, state.posts_loading, state.archive_post_counts[ requested_archive_type ], post_count);
          return post_count;
      } // getArchivePostCount



    } // getters
});


export default store
