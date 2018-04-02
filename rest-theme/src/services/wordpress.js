/**
 *
 * Source: https://github.com/bstavroulakis/vue-wordpress-pwa/blob/master/src/app.config.js
 */
import Vue from 'vue/dist/vue.js'
import Config from '../app.config.js'

let wordpressService = {

  getFromAPI: function( path, resolve, reject ){

        Vue.http.get( path )
          .then(response => {
              if( typeof response.data !== 'object') reject( response );

              let responseData = {posts: response.data, totalPages: 1};
              resolve( responseData );

          })
          .catch(error => reject(error));
  },

  getPageBySlug: function(page_slug) {  //pageId,
    let path = Config.root + "wp-json/wp/v2/page/?slug="+page_slug;
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getPostBySlug: function(post_type, post_slug) {  //pageId,
    let path = Config.root + "wp-json/wp/v2/"+post_type+"/?slug="+post_slug;  // SEO "hydrate" via PHP: Register this API Path+variables, and dump all possible data into a js var in footer?
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getPosts: function() {
    let path = Config.root + "wp-json/wp/v2/post";
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getAuthorPosts: function( author_id) {
    let path = Config.root + "wp-json/wp/v2/post?author="+author_id;
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getMonthPosts: function(year, month, page, perPage, order = 'desc') {    // "yyyy-mm-dd 00:00:00"

    //TODO: Check if month > -1, < 13
    let thisMonthDate=year+"-"+month+'-01 00:00:00';
    let nextMonthDate=year+"-"+month+'-31 00:00:00'; //yes. works for Feb!

    let subQuery = "after="+thisMonthDate+"&before="+nextMonthDate;
    let path = Config.root + `wp-json/wp/v2/post?${subQuery}&page=${page}&order=${order}&per_page=${perPage}`;

    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getTermPosts: function( post_type, taxonomy_name, term_id ) {
    let path = Config.root + "wp-json/wp/v2/"+post_type+"?"+taxonomy_name+"="+term_id;
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getSearchPosts: function( term_slug ) {
    let path = Config.root + "wp-json/wp/v2/post/?search="+term_slug;
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getAuthorInfo: function( author_slug ) {
    let path = Config.root + "wp-json/wp/v2/users/?username="+author_slug;
    return new Promise((resolve, reject) => {

        Vue.http.get( path ).then(response => {
              if( typeof response.data !== 'object') reject( response );

              var responseData = {authors: response.data };
              resolve(responseData)

            })
            .catch(error => reject(error))
    })
  },

  getTermInfo: function(taxonomy_name, term_slug){
    let path = Config.root + "wp-json/wp/v2/"+taxonomy_name+"/?slug="+term_slug;
    return new Promise((resolve, reject) => {

        Vue.http.get( path ).then(response => {
              if( typeof response.data !== 'object') reject( response );

              var responseData = { terms: response.data };

              resolve(responseData)

            })
            .catch(error => reject(error))

    })
  }

} // wordpressService

export default wordpressService;
