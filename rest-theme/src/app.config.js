'use strict'

const Config = {
  root: wp.base_url+'/',
  posts_per_page: 4, //wp.posts_per_page, // from localize /wp
  posts_per_page_api:  20, // TODO: up the API request returns, but keep pagination sane.
//  client: 'http://local.vuewp.com/',
//  loadDbName: 'vwpLocal',
//  analyticsPath: '//www.google-analytics.com/analytics.js'
}

module.exports = Config
