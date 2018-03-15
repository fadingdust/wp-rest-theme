<?php
include_once('includes/vue-router.php');
include_once('includes/rest-api.php');

add_theme_support( 'title-tag' );

function rest_theme_scripts() {
	wp_enqueue_style( 'normalize', get_template_directory_uri() . '/assets/normalize.css', false, '3.0.3' );
	wp_enqueue_style( 'style', get_stylesheet_uri(), array( 'normalize' ) );

	$base_url  = esc_url_raw( home_url() );
	$base_path = rtrim( parse_url( $base_url, PHP_URL_PATH ), '/' );

	$wp_vue= new WP_Vue_Router_Context();

	wp_enqueue_script( 'rest-theme-vue', get_template_directory_uri() . '/rest-theme/dist/build.js', array(), '1.0.0', true );
	wp_localize_script( 'rest-theme-vue', 'wp', array(
		'root'      => esc_url_raw( rest_url() ),
		'base_url'  => $base_url,
		'base_path' => $base_path ? $base_path . '/' : '/',
		'nonce'     => wp_create_nonce( 'wp_rest' ),
		'site_name' => get_bloginfo( 'name' ),
		'components'=> $wp_vue->get_components(),
		'routes'    => $wp_vue->get_routes(),
	) );
}

add_action( 'wp_enqueue_scripts', 'rest_theme_scripts' );
