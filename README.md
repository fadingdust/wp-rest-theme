# WP REST Theme

This is a simple skeleton theme powered by the WordPress REST API and Vue.js. The aim is to
demonstrate how to create a [single page application](https://en.wikipedia.org/wiki/Single-page_application) using
[Vue.js](http://vuejs.org) to power the front end site while fetching data from the backend via the
[WordPress REST API](http://v2.wp-api.org), all without sacrificing SEO.

![](https://cloud.githubusercontent.com/assets/203882/12955214/ec10e59c-d019-11e5-9c15-403c1ba76ce9.gif)

### Demos

This project has multiple branches. Each branch adds a feature overtop the prior branch. The history/progression is as follows:

* [Vue-2](http://github.mwallace.info/vue-2/): Upgrades the original codebase to Vue 2.0+
* [WP-Router](http://github.mwallace.info/wp-router/): Adds in an automatic routing for all Wordpress paths
* TBD..

### Usage

To use the theme on your WordPress site just install it like any other theme, but you'll likely need to compile the dist/build.js file.

### Customization

All of the Vue.js specific code is in the `rest-theme/src` folder. To build the `dist/build.js` script while
developing run the following from the theme root:

```
npm run dev
```

To build the `dist/build.js` script before deploying run:

```
npm run build
```

### Testing
[List of supported URIs](docs/TESTING.md)


### DEBUG:
* term archives with multiple post_types: /path/wp-json/wp/v2/post,news?news_type=194

### TODO:
* Home: blog vs. page
* Sticky Posts: separate query: &sticky=1/0
* Password Protection: &password=abc123
* Widgets (able to be AJAX'd)

### History
* 2018-04: Pagination, Transitions.
* 2018-04: Using native WP Nav, subdirectory installs safe.
* 2018-03: WordpressRoute Builder added
* 2018-03: Vue 2.0 Compatible (@MW)
* 2016-02: Vue 1.0 Based (@GP)

### Credits

Some of the libraries used in the making of this theme:

* [Vue.js](http://vuejs.org)
* [vue-resource](https://github.com/vuejs/vue-resource)
* [vue-router](https://github.com/vuejs/vue-router)
* [vueify](https://github.com/vuejs/vueify)
* [Babel](https://babeljs.io)
* [Browserify](http://browserify.org)
* [normalize.css](https://necolas.github.io/normalize.css)

The WP REST Theme was originally created by [Gilbert Pellegrom](http://gilbert.pellegrom.me) from
[Dev7studios](http://dev7studios.com). Released under the MIT license.
