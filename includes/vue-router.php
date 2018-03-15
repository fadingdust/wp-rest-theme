<?php
/**
 *  WP_Vue_Router_Context
 *  Used to build:
    * a list of components required by Object Types
    * a list of routes for a VueRouter
 *
 */

/**
 * TODO:
   * Add filters: allow for specific/alternate components to be set
   * Add options: sometimes everything is not required: [Home + Pages], [Home, Blog, Single], etc
 */

class WP_Vue_Router_Context{

    //Private vars available via getters
    private $routes;
    private $components;

    //PHP Required Functions
    public function __construct(){
        $this->routes = [];
        $this->components = [];

    // TODO: cache these lists:
        $this->build_context_for_pages();
        $this->build_context_for_taxonomies();
        $this->build_context_for_custom_post_types();
        $this->build_context_for_defaults();
    }
    public function __destruct(){
        unset($this->routes);
        unset($this->components);
    }

    // Public Getters
    public function get_components(){
        return $this->components;
    }
    public function get_routes(){
        return $this->routes;
    }

    //Utility Functions
    private function template_name_cleanup( $template_name ){   //basically, CamelCase-ish it
        //Watch out for thing/thing2-thing3:
        $template_name = basename($template_name);  // Drop paths: thing2-thing3
        $template_name = str_replace(array('-','_'),' ',$template_name ); // Drop wierd chars: thing2 thing3
        $template_name = ucwords($template_name);   // Cap Words: Thing2 Thing3
        $template_name = str_replace(" ","",$template_name); //drop spaces: Thing2Thing3
        return $template_name;
    }

    //The infamous 'god' function(s).
    private function build_context_for_pages(){

        $routes = [];
        $component_templates = [];

        // FRONTPAGE:
        $frontpage_id = get_option( 'page_on_front' );

        // BLOG HOME
        $blog_home_id = get_option( 'page_for_posts' );

        // PAGES
        $this_type = "page";
        $pages = get_pages();
        $domain = get_option('home');

        foreach ( $pages as $page ) {
            // Routes[] = { path: '/gallery/', component: Archive}
            $full_path=str_replace(array($domain, 'http://'.$_SERVER['HTTP_HOST']),'', get_the_permalink($page->ID) );
            $page_template_slug = str_replace(".php", "", get_page_template_slug( $page->ID ) );   // aka: get_post_meta( $post->ID, '_wp_page_template', true )
            if($page_template_slug) $this_type = basename($page_template_slug);

            if( $page->ID == $blog_home_id){
                $route = $full_path;
                $thisRoute=new stdClass();
                  $thisRoute->path = $route;
                  $thisRoute->component = "Blog";
                  //Export
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;

            } else if( $page->ID == $frontpage_id){
                $route = $full_path;
                $thisRoute=new stdClass();
                  $thisRoute->path = $route;
                  $thisRoute->component = "Home";
                  $thisRoute->params = array("post_slug"=>$page->post_name);
                  //Add in extra meta, since '/' is a terrible slug (and inaccurate)
                  $thisRoute->props = new stdClass();
                  $thisRoute->props->default = true;
                  $thisRoute->props->post_slug = $page->post_name;
                  $thisRoute->props->post_type = 'page';

                  //Export
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;

            } else {    //Handle these later under parentPages
            //                $route = str_replace($page->post_name, ":post_slug", $full_path);    //get page-slug from full-path, usually the last in domain.com/1/2/3/last/

                $route = $full_path;
                $thisRoute=new stdClass();
                  $thisRoute->path = $route;
                  $thisRoute->component = $this->template_name_cleanup($this_type);   //TemplateName OR Page
                  //Add in extra meta
                  $thisRoute->props = new stdClass();
                  $thisRoute->props->default = true;
                  $thisRoute->props->post_type = 'page';
                  $thisRoute->props->post_slug = $page->post_name;
                  //Export
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;

            }
        }

        //Export to Class-level vars
        $this->components = array_values(array_unique(array_merge($this->components , $component_templates)));
        $this->routes = array_merge($this->routes, $routes);
    }

    private function build_context_for_taxonomies(){

        $routes = [];
        $component_templates = [];

        //Taxonomies: tax/term
        $this_type = "archive";
        $terms=[];
        $taxonomies = get_taxonomies(array('public'=>true), 'objects');     // publically routable in WP

        foreach ( $taxonomies as $taxonomy ) {
            $thisRoute=new stdClass();
              $thisRoute->path = "/".$taxonomy->rewrite['slug']."/:term_slug/"; //rewrite['slug']
              $thisRoute->component=$this->template_name_cleanup($this_type);
              //Add in extra meta, since '/' is a terrible slug (and inaccurate)
              $thisRoute->props = new stdClass();
              $thisRoute->props->default = true;
              $thisRoute->props->taxonomy_name = $taxonomy->name;   //rewrite['slug'];
              $thisRoute->props->taxonomy_slug = $taxonomy->rewrite['slug'];
              //TODO: Consider adding tax-id?

            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            // PAGED ARCHIVE:
            $thisRoute=new stdClass();
            $thisRoute->path = "/".$taxonomy->rewrite['slug']."/:term_slug/page/:paged_index([\d]*)/"; // rewrite['slug']
            $thisRoute->component=$this->template_name_cleanup($this_type);
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = $this_type;
            $thisRoute->props->taxonomy_name = $taxonomy->name;   //rewrite['slug'];
            $thisRoute->props->taxonomy_slug = $taxonomy->rewrite['slug'];

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            $terms[$taxonomy->name] = get_terms( array( 'taxonomy' => $taxonomy->name ) );
        }

          //Single Post in Categories/Terms..
        $this_type = "post";    //aka single
        foreach ( $terms as $term_tax ) {
        foreach ( $term_tax as $term ) {
            $thisRoute=new stdClass();
              $thisRoute->path = "/".$term->slug."/:post_slug/";
              $thisRoute->component=$this->template_name_cleanup($this_type);
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = $this_type;
            $thisRoute->props->term_slug = $term->slug;
              //TODO: Consider adding term-id?

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            // Just the Term, no Post => /tax/term archive. Should likely be a redirect.
            $thisRoute=new stdClass();
              $thisRoute->path = "/".$term->slug."/";
              $thisRoute->component=$this->template_name_cleanup('archive');
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = 'archive';
            $thisRoute->props->term_slug = $term->slug;
            $thisRoute->props->taxonomy_name = $term->taxonomy;   //rewrite['slug'];
            $thisRoute->props->taxonomy_id = $term->taxonomy_id;   //rewrite['slug'];
            $thisRoute->props->taxonomy_slug = $term->taxonomy;    //$term_tax->rewrite['slug'];
              //TODO: Consider adding term-id?

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

        }
        }

        //Export to Class-level vars
        $this->components = array_values(array_unique(array_merge($this->components , $component_templates)));
        $this->routes = array_merge($this->routes, $routes);
    }

    private function build_context_for_custom_post_types(){
        $routes = [];
        $component_templates = [];

        // CUSTOM POST TYPES
        $args = array(
           'public'   => true,
           '_builtin' => false
        );

        $output = 'names'; // names or objects
        $operator = 'and'; // 'and' or 'or'

        $post_types = get_post_types( $args, $output, $operator );
        $this_type='post';  //Single, likely.
        foreach ( $post_types  as $post_type ) {
            // DEFAULT ARCHIVE route:
            $thisRoute=new stdClass();
            $thisRoute->path = "/".$post_type."/:post_slug/";
            //for known parent-paths.. hmm..
            $thisRoute->component = $this->template_name_cleanup($this_type);
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = $post_type;

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

        }

        //Export to Class-level vars
        $this->components = array_values(array_unique(array_merge($this->components , $component_templates)));
        $this->routes = array_merge($this->routes, $routes);
    }

    private function build_context_for_defaults(){
        $wp_defaults = [];
        $component_templates = [];

        // WP Defaults:
        $wp_defaults = json_decode('[
            { "path": "/search/:term_slug/page/:paged_index/", "component": "Search", "props": true},
            { "path": "/search/:term_slug/", "component": "Search", "props": true},
            { "path": "/author/:author_slug/page/:paged_index/", "component": "Author", "props": true},
            { "path": "/author/:author_slug/", "component": "Author", "props": true},
            { "path": "/:year/:month/:day/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "path": "/:year/:month/:day/", "component": "ArchiveDate", "props": true},
            { "path": "/:year/:day/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "path": "/:year/:day/", "component": "ArchiveDate", "props": true},
            { "path": "/:year/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "path": "/:year/", "component": "ArchiveDate", "props": true}]');

        $component_templates[] = "Search";
        $component_templates[] = "Author";
        $component_templates[] = "ArchiveDate"; //Month, Year?

        //json_decode hates this "ensure it's a number" regex:  ([\d]*)
        foreach($wp_defaults  as $i => $route){
            $wp_defaults[$i]->path = str_replace(array("/:year/", "/:month/", "/:day/", "/:paged_index/"),array("/:year([\d]*)/", "/:month([\d]*)/", "/:day([\d]*)/", "/:paged_index([\d]*)/"), $route->path);
        }


        // DEFAULT: Non-Parent Post
        //don't want this higher than the blog-post-home, nor /year/
        $this_type = "page";  //TODO: front-page!
        $thisRoute=new stdClass();
        $thisRoute->path='/:post_slug';
        $thisRoute->component=$this->template_name_cleanup($this_type);
          //Add in extra meta
        $thisRoute->props = new stdClass();
        $thisRoute->props->default = true;
        $thisRoute->props->post_type = 'post';

        $wp_defaults[] = $thisRoute;
        $component_templates[] = $thisRoute->component;
        $thisRoute=null;

        //Export to Class-level vars
        $this->components = array_values(array_unique(array_merge($this->components , $component_templates)));
        $this->routes = array_merge($this->routes, $wp_defaults);
    }

} //class
