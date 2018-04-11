<?php


function rest_theme_scripts() {

	$base_url  = esc_url_raw( home_url() );
	$base_path = rtrim( parse_url( $base_url, PHP_URL_PATH ), '/' );

	$wp_vue= new WP_Vue_Router_Context();

//To Localize Upon:
	wp_enqueue_script( 'rest-theme-vue', get_template_directory_uri() . '/rest-theme/dist/main.min.js', array(), '1.0.0', true );

//Localize Routes:
	wp_localize_script( 'rest-theme-vue', 'wp', array(
		'root'      => esc_url_raw( rest_url() ),
		'base_url'  => $base_url,
		'base_path' => $base_path ? $base_path . '/' : '/',
		'nonce'     => wp_create_nonce( 'wp_rest' ),
		'site_name' => get_bloginfo( 'name' ),
		'posts_per_page' => get_option("posts_per_page"),
		'components'=> $wp_vue->get_components(),
		'routes'    => $wp_vue->get_routes(),
	) );

//Localize Data:
	get_query_type();

    $pages = rest_theme_get_posts( 'page', 1  )['posts'];
    $posts = rest_theme_get_posts( 'post', 1  )['posts'];

    $post_data = [];
    $post_data['posts'] = array_merge($pages, $posts);     // pagination: get_query_var( 'page', 1 )
    $post_data['terms'] = rest_theme_get_terms( 'category' )['posts'];      // pagination: get_query_var( 'taxonomy' ) // ???

	wp_localize_script( 'rest-theme-vue', 'wpapi', $post_data  );


}

add_action( 'wp_enqueue_scripts', 'rest_theme_scripts', 10 );


/**
 *  Avoid AJAX Calls for "low"-script (SEO Robots?)
 *
 */
function get_query_type(  ){
global $wp_query;

$query_type= 'post';

return $query_type;
}

/**
 * Get REST API response for posts
 * Source: https://torquemag.io/2017/04/using-the-wordpress-rest-api-without-an-extra-http-request/
 * @param int $page
 *
 * @return array
 */
function rest_theme_get_posts( $post_type = 'post', $paging_index = 1 ){

	$controller = new WP_REST_Posts_Controller( $post_type );
                    // WP_REST_Post_Meta_Fields( $post_type );
                    // WP_REST_Post_Types_Controller();
                    // WP_REST_Taxonomies_Controller();
                    // WP_REST_Terms_Controller( $taxonomy );

	$request = new WP_REST_Request('', '', array(
		'page' => $paging_index,
		'per_page'=>4   //doesn't work!
	));
	$items = $controller->get_items( $request );

	$response = rest_ensure_response( $items );
	$headers = $response->get_headers();
	return array(
		'api'   => rest_url( 'wp/v2/posts' ),
		'page'  => $page,
		'pages' => $headers[ 'X-WP-TotalPages' ],
		'posts' => $response->get_data()
	);
}


function rest_theme_get_terms( $taxonomy = 'category' ){

	$controller = new  WP_REST_Terms_Controller( $taxonomy );

	$request = new WP_REST_Request('', '', array());

	$items = $controller->get_items( $request );

	$response = rest_ensure_response( $items );

	$headers = $response->get_headers();
	return array(
		'api'   => rest_url( 'wp/v2/posts' ),
		'page'  => $page,
		'pages' => $headers[ 'X-WP-TotalPages' ],
		'posts' => $response->get_data()
	);
}
