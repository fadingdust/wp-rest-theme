<?php

// Add the Number of queries to the header, b/c I'm a nerd.
add_filter( 'rest_pre_serve_request', function( $value ) {
    header( 'X-Query-Count: '.intval( get_num_queries() ) );
    return $value;
});


// WP-API Post Responses:
add_action( "rest_api_init", function () {

    // CUSTOM POST TYPES
    $post_types_args = array(
       'public'   => true,
       '_builtin' => false
    );

    $post_types = get_post_types( $post_types_args, 'names', 'and' );
    $posts_post_types = array_merge( array( "post", "posts" ), $post_types);
    $pages_posts_post_types = array_merge(array( "page", "pages", "post", "posts" ), $post_types);

    // Add date_rendered
    register_rest_field( $posts_post_types, "date_rendered", array(
        "get_callback" => function( $post ) {
            return get_the_date('', $post->id);
        },
        "schema" => array(
            "description" => __( "Pretty Date." ),
            "type"        => "string"
        ),
    ) );

    // Add permalink:
    register_rest_field( $pages_posts_post_types, "permalink_path", array(
        "get_callback" => function( $post ) {
            return str_replace(  home_url() , "", get_the_permalink($post->id) );
        },
        "schema" => array(
            "description" => __( "Permalink Path" ),
            "type"        => "string"
        ),
    ) );

    // Add Author Info
    register_rest_field( $posts_post_types, "author_object", array(
        "get_callback" => function( $post ) {
            return array(
                'id'=>$post['author'],
                'name'=>get_the_author($post['author']),
                'link_to_posts'=>get_author_posts_url($post['author'])
                //'description'=>get_the_author_meta( 'description', $post['author'] )
            );
        },
        "schema" => array(
            "description" => __( "Author Data." ),
            "type"        => "object"
        ),
    ) );


    // Add category info to post-details, not just the category-ids
    register_rest_field( $posts_post_types, "categories_list", array(
        "get_callback" => function( $post ) {
            $cats=array();
            foreach((get_the_category($post['id'])) as $category) {
                $cats[] = array_merge( (array)$category, array('link'=>get_category_link($category->term_id))  );
            }
            return $cats;
        },
        "schema" => array(
            "description" => __( "Categories Detail" ),
            "type"        => "object"
        ),
    ) );


    // Add featured_image url to post-details, not just the media-id
    register_rest_field(  $pages_posts_post_types, "featured_image", array(
        "get_callback" => function( $post ) {
            return (object) array(
                "html"=>get_the_post_thumbnail( $post['id'], 'large' ),
                "url"=>wp_get_attachment_image_src( get_post_thumbnail_id( $post['id']), 'full', false  ),
                "url_large"=>wp_get_attachment_image_src( get_post_thumbnail_id( $post['id']), 'large'  , false),
                "url_square"=>wp_get_attachment_image_src( get_post_thumbnail_id( $post['id']), 'square' , false ),

              );
        },
        "schema" => array(
            "description" => __( "Featured Image HTML." ),
            "type"        => "object"
        ),
    ) );


} );


/**
* Add REST API support to *ALL* already registered post types.
*/
add_action( 'init', 'wp_rest_custom_post_type', 25 );
function wp_rest_custom_post_type() {
  global $wp_post_types;

  foreach($wp_post_types as $post_type_name =>$post_type){
    if( isset( $wp_post_types[ $post_type_name ] ) ) {
      $wp_post_types[$post_type_name]->show_in_rest = true;
      $wp_post_types[$post_type_name]->rest_base = $post_type_name;
      $wp_post_types[$post_type_name]->rest_controller_class = 'WP_REST_Posts_Controller';
    }
  }

}

/**
* Add REST API support to *ALL* already registered taxonomies.
*/
add_action( 'init', 'wp_rest_custom_taxonomy', 25 );
function wp_rest_custom_taxonomy() {
  global $wp_taxonomies;

  foreach($wp_taxonomies as $taxonomy_name =>$taxonomy){
    if ( isset( $wp_taxonomies[ $taxonomy_name ] ) ) {
      $wp_taxonomies[ $taxonomy_name ]->show_in_rest = true;
      $wp_taxonomies[ $taxonomy_name ]->rest_base = $taxonomy_name;
      $wp_taxonomies[ $taxonomy_name ]->rest_controller_class = 'WP_REST_Terms_Controller';
    }
  }

}
