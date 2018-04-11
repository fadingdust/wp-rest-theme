<?php
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds Support: theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 *
 */
add_action( 'after_setup_theme', function () {
    global $package_prefix;

	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on VueWP, use a find and replace
	 * to change 'vuewp' to the name of your theme in all the template files.
	 */
//	load_theme_textdomain( 'vuewp', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );

	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
	 */
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus( array(
		'primary' => esc_html__( 'Primary', $package_prefix ),
	) );

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
	) );


    /**
     * Changes url prefix
     * to match our vue route
     * so a page will look like
     * /category-name/post-name/
     * /parent-page/page-name/
     * Src: https://github.com/michaelsoriano/wp-vue-starter/blob/master/functions.php
     * https://stackoverflow.com/questions/17613789/wordpress-rewrite-add-base-prefix-to-pages-only *
     *
     */
    function change_base_permalinks() {
      global $wp_rewrite;

      $wp_rewrite->permalink_structure = '%category%/%postname%/';
      $wp_rewrite->flush_rules();

      //look into this:
      //https://wordpress.stackexchange.com/questions/152306/change-permalinks-structure-for-specific-category
    }
    add_action('after_setup_theme','change_base_permalinks');



});



function new_excerpt_more($more) {
  return '&hellip; <a class="read-more" href="' . get_permalink( get_the_ID() ) . '">Continue Reading</a>';
}
add_filter('excerpt_more', 'new_excerpt_more');
