<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<script>console.log("First Script: Head");</script>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
    <?php wp_head(); ?>
</head>
<body>

    <header class="container-fluid site-header">

      <nav class="navbar fixed-top navbar-expand-lg navbar-toggleable-md <?php if(is_front_page()){echo "front-page-nav";} ?>">
      <!-- fixed-top -->

        <a class="navbar-brand alignleft align-left" href="<?php echo esc_url( home_url('/') ); ?>">
          <div class="fa fa-apple fa-2x"></div>
        </a>

        <button class="navbar-toggler align-right alignright navbar-toggler-right justify-content-end collapsed" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
          <div class="nav-label">Menu</div>
        </button>

        <div class="navbar-collapse collapse justify-content-end" id="navbarSupportedContent">

          <?php
            wp_nav_menu( array(
              'theme_location'  => 'primary',
              'container'       => false,
              'menu_class'      => '',
              'fallback_cb'     => '__return_false',
              'items_wrap'      => '<ul class="navbar-nav">%3$s</ul>',
              'depth'           => 2,
              'walker'          => new WP_Bootstrap_Navwalker()
            ) );
          ?>

        </div>
      </nav>
    </header>


    <noscript>
        <div id="content">
            <?php
            if ( have_posts() ) :

                if ( is_home() && ! is_front_page() ) {
                    echo '<h1>' . single_post_title( '', false ) . '</h1>';
                }

                while ( have_posts() ) : the_post();

                    if ( is_singular() ) {
                        the_title( '<h1>', '</h1>' );
                    } else {
                        the_title( '<h2><a href="' . esc_url( get_permalink() ) . '">', '</a></h2>' );
                    }

                    the_content();

                endwhile;

            endif;
            ?>
        </div>
    </noscript>

    <div id="app"></div>

    <?php wp_footer(); ?>

</body>
</html>
