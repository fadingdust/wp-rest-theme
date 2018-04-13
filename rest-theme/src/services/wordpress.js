/**
 *
 * Source: https://github.com/bstavroulakis/vue-wordpress-pwa/blob/master/src/app.config.js
 */

import Vue from 'vue/dist/vue.js'
//import Vue from 'vue'
//var Vue = require('vue')
//import Vue from 'vue'
import Config from '../app.config.js'

let wordpressService = {

  getFromAPI: function( path, resolve, reject ){
        const apiTime = new Date();
        Vue.http.get( path )
          .then(response => {
              if( typeof response.data !== 'object') reject( response );
              const apiTimeDiff = ((new Date())-apiTime);
              console.log("apiTime:", apiTimeDiff ); // TODO: track render & api times

              let responseData = {posts: response.data,  totalPosts: parseInt(response.headers.map['x-wp-total'][0]),  totalPages: parseInt(response.headers.map['x-wp-totalpages'][0])  };
              resolve( responseData );

          })
          .catch(error => reject(error));
  },

  getPostBySlug: function(post_type, post_slug) {  //pageId,
    let path = Config.root + "wp-json/wp/v2/"+post_type+"/?slug="+post_slug;  // SEO "hydrate" via PHP: Register this API Path+variables, and dump all possible data into a js var in footer?
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getPosts: function(post_type, pageIndex, perPage) {
    let path = Config.root + "wp-json/wp/v2/"+post_type+"?page="+Math.max(1,parseInt(pageIndex))+"&per_page="+Math.max(1,parseInt(perPage));
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getAuthorPosts: function( author_id, pageIndex, perPage) {
    let path = Config.root + "wp-json/wp/v2/post?author="+author_id+"&page="+Math.max(1,parseInt(pageIndex))+"&per_page="+Math.max(1,parseInt(perPage));
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getMonthPosts: function(year, month, pageIndex, perPage, order = 'desc') {    // "yyyy-mm-dd 00:00:00"

    //TODO: Check if month > -1, < 13
    let month1=month;
    let month2=month;
    if(!month){
      month1="01";
      month2=12;
    }
    let thisMonthDate=year+"-"+month1+'-01 00:00:00';
    let nextMonthDate=year+"-"+month2+'-31 00:00:00'; //yes. works for Feb!

    let subQuery = "after="+thisMonthDate+"&before="+nextMonthDate;
    let path = Config.root + "wp-json/wp/v2/post?"+subQuery+"&page="+Math.max(1,parseInt(pageIndex))+"&per_page="+Math.max(1,parseInt(perPage))+"&order="+order;

    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getTermPosts: function( post_type, taxonomy_name, term_id, pageIndex , perPage ) {
    let path = Config.root + "wp-json/wp/v2/"+post_type+"?"+taxonomy_name+"="+term_id+"&page="+Math.max(1,parseInt(pageIndex))+"&per_page="+Math.max(1,parseInt(perPage));
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

  getSearchPosts: function( term_slug, pageIndex , perPage) {
    let path = Config.root + "wp-json/wp/v2/post/?search="+term_slug+"&page="+Math.max(1,parseInt(pageIndex))+"&per_page="+Math.max(1,parseInt(perPage));
    return new Promise((resolve, reject) => {
        this.getFromAPI( path, resolve, reject );
    })
  },

//////////////// Non-Posts ////////////////
  getAuthors: function( author_slug , per_page ) {
    let path = Config.root + "wp-json/wp/v2/users/?per_page"+per_page;
    return new Promise((resolve, reject) => {

        Vue.http.get( path ).then(response => {
              if( typeof response.data !== 'object') reject( response );

              resolve({authors: response.data })
            })
            .catch(error => reject(error))
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

  getTaxTerms: function( taxonomy_name, per_page ){ //, term_slug){
    let path = Config.root + "wp-json/wp/v2/"+taxonomy_name+"/?per_page="+per_page; //+"/?slug="+term_slug;
    return new Promise((resolve, reject) => {

        Vue.http.get( path ).then(response => {
              if( typeof response.data !== 'object') reject( response );

              resolve({ terms: response.data })
            })
            .catch(error => reject(error));

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
