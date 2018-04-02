<?php

/**
 * Enqueue scripts and styles.
 */
function theme_scripts() {

    wp_enqueue_style( 'font-awesome', "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" );

    wp_register_style( 'bootstrap-css', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css', false, '4.0.0-beta.3', null );
    wp_enqueue_style('bootstrap-css' );

    wp_register_style( 'google-lato-merriweather', 'https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i,700,700i|Merriweather:300,300i,400,700,700i', false, null );
    wp_enqueue_style( 'google-lato-merriweather' );

    wp_enqueue_style( 'vuewp-style', get_stylesheet_uri() );


//BootStrap:
    wp_deregister_script( 'jquery' );
    wp_register_script( 'jquery', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js', false, '1.8.1', false );
    wp_enqueue_script( 'jquery' );

    wp_register_script( 'popper',  'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js', false, '1.13.0', true); //must be .umd.
    wp_enqueue_script( 'popper' ); //enables all pop-over links.
    wp_enqueue_script( 'bootstrap-js', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js', array('jquery','popper'), '4.0.0-beta.3', null );

    wp_register_script( 'modernizr',  'https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js', false, '2.8.3', true );
    wp_enqueue_script( 'modernizr' );

}
add_action( 'wp_enqueue_scripts', 'theme_scripts', 10 );

