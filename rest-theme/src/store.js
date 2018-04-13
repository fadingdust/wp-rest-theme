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

function getPageFromAPI(get_object, archive_index){
            /**
             * Sample Data:
             *  Given: uiPostsPerPage = 4; apiPostsPerPage = 10
             *
             *  actualPostIndex | uiPageIndex | apiPageIndex | uiPostIndex | apiPostIndex
             *  0               | 1           | 0            | 0           | 0
             *  1               | 1           | 0            | 0           | 0
             *  2               | 1           | 0            | 0           | 0
             *  ...
             *  6               | 2           | 0            | 4           | 0
             *  7               | 2           | 0            | 4           | 0
             *  8               | 3           | 0            | 8           | 0
             *  9               | 3           | 0            | 8           | 0
             *  10              | 3           | 1            | 8           | 10
             *  11              | 3           | 1            | 8           | 10
             *  12              | 4           | 1            | 12          | 10
             */

             //TODO: pagination is insane. Watch out for sorting: it will be worse - the archive-index will be wrong.
             //NOTE: Math.mod() might be easier?
    // basic maths for this section
    const uiPostIndex = ( get_object.paged_index - 1 ) * get_object.posts_per_page; //this is 0-based: 0 = first post; 20 = first post of 2nd page of 10.
    let apiPageIndex = Math.floor( uiPostIndex / Config.posts_per_page_api);  // post-index of 20 / 20/req = api page 1 ( 0-based);

    const apiPostIndex = (apiPageIndex) * Config.posts_per_page_api; // 0-based

    // just for whether to load from API:
    const ui_paged_postids = _.chunk( archive_index, Config.posts_per_page);
    let found_posts_ids = [];

    if( ui_paged_postids.length >= ( get_object.paged_index - 1 )){ // make sure we have enough to get this index
      found_posts_ids = ui_paged_postids[ get_object.paged_index - 1 ]; //the posts that will go on the UI page
    }
    const stored_postids = _.compact(found_posts_ids); // remove nulls
console.log("Get Posts from API ("+uiPostIndex+"/"+apiPageIndex+","+apiPostIndex+")? ", stored_postids.length+" == "+get_object.posts_per_page ,(apiPostIndex)+stored_postids.length +" == "+archive_index.length);

    if( archive_index.length>0 && ( stored_postids.length == get_object.posts_per_page || (uiPostIndex)+stored_postids.length == archive_index.length)){
      apiPageIndex = -1; // don't get any api pages
    }

    return apiPageIndex;

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
      archive_post_index: { 'post_type': {}, 'author': {}, 'month': {}, 'taxonomy': {}  }, // blog==post_type.post  // no way to keep track of if all of a month's posts are available/loaded except straight from API response.
          // 'taxonomy': { 'category': { 'uncategorized': {} } }
          // TODO: No good way to handle complex queries: post_type+taxonomy_term (assuming term is in 2 post_types)
              // i can intersect the full indicies, assuming I have them.
              // getting from API can't be split into 2 indicies :/
          // should these actually be post-slug/id indicies to track where they are in pagination??
          // and how do i handle sorting? chunking is after sort!

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
      SET_ARCHIVE_INDEX: (state,  archive_info ) => {   // { 'type':'author', 'author_id': author_id, 'count':response.totalPosts }
          let tmp = state.archive_post_index;
/*
          // First-Init:
          if( typeof tmp[ archive_info.type ][ archive_info.slug ].index == "undefined" && archive_info.count && typeof archive_info.index =="undefined"){
            archive_info.index = _.fill(Array(archive_info.count), null);
          }
*/
          tmp[ archive_info.type ][ archive_info.slug ] = { 'count': archive_info.count, 'index': archive_info.index }; //non-reactive update method :/

          state.archive_post_index = tmp;
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
        return new Promise((resolve, reject) => {

            //clean up params:
            get_object.paged_index=parseInt(get_object.paged_index);
            get_object.posts_per_page=parseInt(get_object.posts_per_page);

            let archive_index = this.getters.getArchivePostIndex( 'post_type', get_object.post_type ); // will add to this from API

            // Decide if we need to get from API
            const apiPageIndex = getPageFromAPI(get_object, archive_index);

            if( apiPageIndex < 0 ){
                resolve({ raw: archive_index});
                commit('SET_POSTS_LOADING', false);

            }else{ // need more posts!
                // archive_index, apiPageIndex & apiPostIndex are the only 3 needed from above!

                const apiPostIndex = (apiPageIndex) * Config.posts_per_page_api;

                commit('SET_POSTS_LOADING', true);
                WordpressService.getPosts(get_object.post_type,  apiPageIndex + 1 , Config.posts_per_page_api).then((response) => { // 1-based paging!
                  resolve({ raw: response});
                  if( response.totalPosts > -1){
                    if( archive_index.length == 0 ) archive_index = _.fill(Array(response.totalPosts), null);

                    if( archive_index.length > response.totalPosts ) console.log("FETCH_POSTS: too many posts!",  archive_index.length , response.totalPosts);

                    // assign the post-id to the archive's index: how we know if we have the post in cache-store
                    let post_index = 0;
                    for(let post of response.posts){
//                    console.log("FETCH_POSTS: adding to archive_index: ", uiPostIndex, apiPostIndex, (apiPostIndex + post_index) ,  post.id );
                      archive_index[(apiPostIndex + post_index)] = post.id;
                      post_index++;
                    }

                    commit('SET_ARCHIVE_INDEX', { type: 'post_type', slug: get_object.post_type, count: response.totalPosts, index: archive_index });

                  }

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

            //clean up params:
            get_object.paged_index=parseInt(get_object.paged_index);
            get_object.posts_per_page=parseInt(get_object.posts_per_page);

            let archive_index_group='taxonomy';
            let archive_index_slug= get_object.term_object.taxonomy+'/'+get_object.term_object.slug;
            if( get_object.term_object.id < 0 ){ //blog page
              archive_index_group = 'post_type';
              archive_index_slug = 'post';  //requested_types[0];
            }

            let archive_index = this.getters.getArchivePostIndex( archive_index_group, archive_index_slug); // will add to this from API

            // Decide if we need to get from API
            const apiPageIndex = getPageFromAPI(get_object, archive_index);
            const apiPostIndex = (apiPageIndex) * Config.posts_per_page_api;

            if( apiPageIndex < 0 ){
                resolve({ raw: archive_index});
                commit('SET_POSTS_LOADING', false);

            }else{ // need more posts!

                commit('SET_POSTS_LOADING', true);
                for(let post_type of get_object.post_types){
                    // TODO: multiple post-types..
                    WordpressService.getTermPosts( post_type, get_object.taxonomy_name,  get_object.term_object.id , apiPageIndex + 1 , Config.posts_per_page_api).then((response) => {
                      console.log("FETCH_TERM_POSTS: Service.getTermPosts: ", response);
                      resolve({ raw: response});


                      if( response.totalPosts > -1){
                        if( archive_index.length == 0 ) archive_index = _.fill(Array(response.totalPosts), null);

                        if( archive_index.length > response.totalPosts ) console.log("FETCH_TERM_POSTS: too many posts!",  archive_index.length , response.totalPosts);

                        // assign the post-id to the archive's index: how we know if we have the post in cache-store
                        let post_index = 0;
                        for(let post of response.posts){
                          archive_index[(apiPostIndex + post_index)] = post.id;
                          post_index++;
                        }

                        commit('SET_ARCHIVE_INDEX', { type: archive_index_group, slug: archive_index_slug, count: response.totalPosts, index: archive_index });

                      }

                      commit('STORE_POSTS', { posts: response.posts });

                    }, err => { // seems to be rare in normal circumstances.
                      console.log("FETCH_TERM_POSTS: err:",err, get_object );
                      reject({ raw: err});
                      commit('SET_POSTS_LOADING', false);
                    });
                  }
            }
        }); // return Promise
      },

      FETCH_MONTH_POSTS ({ commit }, get_object ) {   // get_object.year, get_object.month, get_object.paged_index
        return new Promise((resolve, reject) => {

            //clean up params:
            get_object.paged_index=parseInt(get_object.paged_index);
            get_object.posts_per_page=parseInt(get_object.posts_per_page);

            const archive_index_group ='month';
            const archive_index_slug = get_object.year+"/"+get_object.month;

            let archive_index = this.getters.getArchivePostIndex( archive_index_group, archive_index_slug ); // will add to this from API

            // Decide if we need to get from API
            const apiPageIndex = getPageFromAPI(get_object, archive_index);
            const apiPostIndex = (apiPageIndex) * Config.posts_per_page_api;

            if( apiPageIndex < 0 ){
                resolve({ raw: archive_index});
                commit('SET_POSTS_LOADING', false);

            }else{ // need more posts!

                commit('SET_POSTS_LOADING', true);
                WordpressService.getMonthPosts( get_object.year, get_object.month, apiPageIndex + 1, Config.posts_per_page_api, get_object.order ).then((response) => {

                  if( response.totalPosts > -1){
                    if( archive_index.length == 0 ) archive_index = _.fill(Array(response.totalPosts), null);

                    if( archive_index.length > response.totalPosts ) console.log("FETCH_MONTH_POSTS: too many posts!",  archive_index.length , response.totalPosts);

                    // assign the post-id to the archive's index: how we know if we have the post in cache-store
                    let post_index = 0;
                    for(let post of response.posts){
//                    console.log("FETCH_POSTS: adding to archive_index: ", uiPostIndex, apiPostIndex, (apiPostIndex + post_index) ,  post.id );
                      archive_index[(apiPostIndex + post_index)] = post.id;
                      post_index++;
                    }

                    commit('SET_ARCHIVE_INDEX', { type: archive_index_group, slug: archive_index_slug, count: response.totalPosts, index: archive_index });

                  }

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

            //clean up params:
            get_object.paged_index=parseInt(get_object.paged_index);
            get_object.posts_per_page=parseInt(get_object.posts_per_page);

            const archive_index_group ='author';
            const archive_index_slug = get_object.author.slug;

            let archive_index = this.getters.getArchivePostIndex( archive_index_group, archive_index_slug ); // will add to this from API

            // Decide if we need to get from API
            const apiPageIndex = getPageFromAPI(get_object, archive_index);
            const apiPostIndex = (apiPageIndex) * Config.posts_per_page_api;

            if( apiPageIndex < 0 ){
                resolve({ raw: archive_index});
                commit('SET_POSTS_LOADING', false);

            }else{ // need more posts!
                  commit('SET_POSTS_LOADING', true);
                  WordpressService.getAuthorPosts( get_object.author.id,  apiPageIndex + 1, Config.posts_per_page_api ).then((response) => {

                    if( response.totalPosts > -1){
                      if( archive_index.length == 0 ) archive_index = _.fill(Array(response.totalPosts), null);

                      if( archive_index.length > response.totalPosts ) console.log("FETCH_AUTHOR_POSTS: too many posts!",  archive_index.length , response.totalPosts);

                      // assign the post-id to the archive's index: how we know if we have the post in cache-store
                      let post_index = 0;
                      for(let post of response.posts){
                        archive_index[(apiPostIndex + post_index)] = post.id;
                        post_index++;
                      }

                      commit('SET_ARCHIVE_INDEX', { type: archive_index_group, slug: archive_index_slug, count: response.totalPosts, index: archive_index });
                    }

                    commit('STORE_POSTS', { posts: response.posts });

                    resolve({ raw: response});

                  }, err => { // seems to be rare in normal circumstances.
                    console.log("FETCH_AUTHOR_POSTS: err:",err, get_object );
                    reject({ raw: err});

                    commit('SET_POSTS_LOADING', false);
                  });

            }//if/else
        }); // return Promise
      },
      FETCH_TERMS ({ commit }, get_object ) { // .taxonomy_name, .term_slug
        return new Promise((resolve, reject) => {
            get_object.paged_index=parseInt(get_object.paged_index);

            let found_terms = this.getters.getTerms(get_object.taxonomy_name, get_object.term_slug ); //make sure we have the one we want..

            if( found_terms.length > 0){
                // no need to get the same posts..
                  commit('SET_TERMS_LOADING', false);
                  resolve({ raw: found_terms });

            }else {

                commit('SET_TERMS_LOADING', true);
                WordpressService.getTaxTerms( get_object.taxonomy_name , getPerRequest.terms   ).then(response => {  // might as well get all of 'em! //, get_object.term_slug
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

      getPostsByTerm: (state) => (requested_types, requested_taxonomy, requested_term_object, paged_index, posts_per_page) => {  //handle pagination!
        let found_posts_ids = [];
        let found_posts = [];

        let archive_index_group='taxonomy';
        let archive_index_slug= requested_taxonomy+'/'+requested_term_object.slug;
        if( requested_term_object.id < 0 ){ //blog page
          archive_index_group = 'post_type';
          archive_index_slug = 'post';  //requested_types[0];
        }

        if( state.posts.length > 0 ){

// chunk the index
          let archive_index = []; //this.getters.getArchivePostIndex( requested_archive_type, requested_archive_slug );  // state.archive_post_index.post_type.post.index
          if( state.archive_post_index[ archive_index_group ][ archive_index_slug ] && state.archive_post_index[ archive_index_group ][ archive_index_slug ].index ) archive_index = state.archive_post_index[ archive_index_group ][ archive_index_slug ].index
          if( archive_index.length > 0 ){
            const paged_posts = _.chunk(archive_index, Config.posts_per_page);
            found_posts_ids = paged_posts[ paged_index - 1];
          }

// attach known posts to the index-chunk (page)
          if( found_posts_ids.length > 0 ){
            found_posts = state.posts.reduce(
                function(accumulator, currentPost) {
                  let safe_to_add = false;

                  if(  found_posts_ids.indexOf(currentPost.id) > -1  ){
                    safe_to_add = true;
                  }

                  if( safe_to_add ) accumulator.push( currentPost );

                  return accumulator;
                },
                [] // do i preload these with prior page empties?
              );
          }

        } //if state.posts

        return found_posts;
      },

      getPostsByMonth: (state) => (requested_year, requested_month, paged_index) => {  //handle pagination!
        let found_posts_ids = [];
        let found_posts = [];

        let archive_index_group='month';
        let archive_index_slug= requested_year+'/'+requested_month;

        if( state.posts.length > 0 ){

// chunk the index
          let archive_index = []; //this.getters.getArchivePostIndex( requested_archive_type, requested_archive_slug );  // state.archive_post_index.post_type.post.index
          if( state.archive_post_index[ archive_index_group ][ archive_index_slug ] && state.archive_post_index[ archive_index_group ][ archive_index_slug ].index ) archive_index = state.archive_post_index[ archive_index_group ][ archive_index_slug ].index
          if( archive_index.length > 0 ){
            const paged_posts = _.chunk(archive_index, Config.posts_per_page);
            found_posts_ids = paged_posts[ paged_index - 1];
          }

// attach known posts to the index-chunk (page)
          if( found_posts_ids.length > 0 ){
            found_posts = state.posts.reduce(
                function(accumulator, currentPost) {
                  let safe_to_add = false;

                  if(  found_posts_ids.indexOf(currentPost.id) > -1  ){
                    safe_to_add = true;
                  }

                  if( safe_to_add ) accumulator.push( currentPost );

                  return accumulator;
                },
                [] // do i preload these with prior page empties?
              );
          }

        } //if state.posts

        return found_posts;
      },

      getPostsByAuthorSlug: (state) => ( requested_author_slug, paged_index, posts_per_page) => {  //handle pagination!
        let found_posts_ids = [];
        let found_posts = [];

        let archive_index_group='author';
        let archive_index_slug = requested_author_slug;

        if( state.posts.length > 0 ){

// chunk the index
          let archive_index = []; //this.getters.getArchivePostIndex( requested_archive_type, requested_archive_slug );  // state.archive_post_index.post_type.post.index
          if( state.archive_post_index[ archive_index_group ][ archive_index_slug ] && state.archive_post_index[ archive_index_group ][ archive_index_slug ].index ) archive_index = state.archive_post_index[ archive_index_group ][ archive_index_slug ].index
          if( archive_index.length > 0 ){
            const paged_posts = _.chunk(archive_index, Config.posts_per_page);
            found_posts_ids = paged_posts[ paged_index - 1];
          }

// attach known posts to the index-chunk (page)
          if( found_posts_ids.length > 0 ){
            found_posts = state.posts.reduce(
                function(accumulator, currentPost) {
                  let safe_to_add = false;

                  if(  found_posts_ids.indexOf(currentPost.id) > -1  ){
                    safe_to_add = true;
                  }

                  if( safe_to_add ) accumulator.push( currentPost );

                  return accumulator;
                },
                [] // do i preload these with prior page empties?
              );
          }

        } //if state.posts

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

        return found_author;
      }, // getAuthorBySlug

      getArchivePostIndex: (state) => ( requested_archive_type, requested_archive_slug ) => {
          let post_index = [];

          if(state.archive_post_index[ requested_archive_type ].hasOwnProperty( requested_archive_slug ) ) post_index = state.archive_post_index[ requested_archive_type ][ requested_archive_slug ].index;

          return post_index;
      }, // getArchivePostCount


      getArchivePostCount: (state) => ( requested_archive_type, requested_archive_slug ) => {
          let post_count = -1;

          if( state.archive_post_index[ requested_archive_type ].hasOwnProperty( requested_archive_slug ) ) post_count = state.archive_post_index[ requested_archive_type ][ requested_archive_slug ].count;

          return post_count;
      } // getArchivePostCount



    } // getters
});


export default store
