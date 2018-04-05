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
    private $options;

    //PHP Required Functions
    public function __construct(){
        $this->routes = [];
        $this->components = [];
        $options = [];

        $options['taxonomies']['hide_empty_terms'] = true;

    // TODO: cache these lists:
        $this->build_context_for_pages();
        $this->build_context_for_custom_post_types();   //Prefer post types over taxonomies
        $this->build_context_for_taxonomies( $options['taxonomies'] );
        $this->build_context_for_defaults();

        //TODO: Add a warning / filter for duplicate/conflicting routes?
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
        $component_name = "page";
        $pages = get_pages();
        $domain = get_option('home');

        foreach ( $pages as $page ) {
            // Routes[] = { path: '/gallery/', component: Archive}
            $full_path=str_replace( array($domain, 'https://', 'http://', $_SERVER['HTTP_HOST']), '', get_the_permalink($page->ID) ); //Pare off what the registered wp domain, but also any other domain this might be run on
            $page_template_slug = str_replace(".php", "", get_page_template_slug( $page->ID ) );
            if($page_template_slug) $component_name = basename($page_template_slug);

            if( $page->ID == $blog_home_id){
                $thisRoute=new stdClass();
                $thisRoute->name = 'Blog';
                  $thisRoute->path = $full_path;
                  $thisRoute->component = "Blog";
                  //Export
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;

                // PAGED BLOG:
                $thisRoute=new stdClass();
                $thisRoute->name = 'Blog-Paged';
                $thisRoute->path = $full_path."page/:paged_index([\d]*)/"; // rewrite['slug']
                $thisRoute->component="Blog"; //$this->template_name_cleanup($component_name);
                  //Add in extra meta
                $thisRoute->props = new stdClass();
                $thisRoute->props->default = true;
                $thisRoute->props->post_type = 'post';  // BUG: ???
                $thisRoute->props->post_types = 'post'; //$taxonomy->object_type;
                  //Export
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;



            } else if( $page->ID == $frontpage_id){
                $thisRoute=new stdClass();
                  $thisRoute->path = $full_path;
                  $thisRoute->name = 'Home';
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

            } else {    //Handle these later under parentPages?
                $thisRoute=new stdClass();
                  $thisRoute->path = $full_path;
                  $thisRoute->component = $this->template_name_cleanup($component_name);   //TemplateName OR Page
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

    private function build_context_for_taxonomies( $options ){

        $routes = [];
        $component_templates = [];

        //Taxonomies: tax/term
        $component_name = "archive";
        $terms=[];
        $taxonomies = get_taxonomies(array('public'=>true), 'objects');     // publically routable in WP

        foreach ( $taxonomies as $taxonomy ) {
            $thisRoute=new stdClass();
              $thisRoute->name = 'Taxonomy-'.ucwords($taxonomy->name)."-Archive";
              $thisRoute->path = "/".$taxonomy->rewrite['slug']."/:term_slug/"; //rewrite['slug']
              $thisRoute->component=$this->template_name_cleanup($component_name);
              //Add in extra meta
              $thisRoute->props = new stdClass();
              $thisRoute->props->default = true;
              $thisRoute->props->post_type = 'post';  // BUG: ???
              $thisRoute->props->post_types = $taxonomy->object_type;
              $thisRoute->props->taxonomy_name = $taxonomy->name;   //rewrite['slug'];
              $thisRoute->props->taxonomy_slug = $taxonomy->rewrite['slug'];
              //TODO: Consider adding tax-id?

            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            // PAGED ARCHIVE:
            $thisRoute=new stdClass();
            $thisRoute->name = 'Taxonomy-'.ucwords($taxonomy->name).'-Archive-Paged';
            $thisRoute->path = "/".$taxonomy->rewrite['slug']."/:term_slug/page/:paged_index([\d]*)/"; // rewrite['slug']
            $thisRoute->component=$this->template_name_cleanup($component_name);
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = 'post';  // BUG: ???
            $thisRoute->props->post_types = $taxonomy->object_type;
            $thisRoute->props->taxonomy_name = $taxonomy->name;   //rewrite['slug'];
            $thisRoute->props->taxonomy_slug = $taxonomy->rewrite['slug'];

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            $terms[$taxonomy->name] = array( 'terms'=>get_terms( array( 'taxonomy' => $taxonomy->name )) , 'post_types'=>$taxonomy->object_type );
        }

          //Single Post in Categories/Terms..
        foreach ( $terms as $tax_name=>$term_info ) {
        $term_post_types = $term_info['post_types'];
        foreach ( $term_info['terms'] as $i=>$term ) {
            //Per Loop Init
            $add_route = true;
            if( $option['hide_empty_terms'] && $term->count == 0){
                 $add_route = false;
            } else{
                 $add_route = true;
            }

            //Add Route:
            $thisRoute=new stdClass();
              $thisRoute->name = 'TaxonomyTerm-'.ucwords($tax_name).'-'.ucwords($term->slug).'-post';
              $thisRoute->path = "/".$term->slug."/:post_slug/";
              $thisRoute->component=$this->template_name_cleanup('post');
              //Add in extra meta

            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = 'post';  //deprecate this
            $thisRoute->props->term_slug = $term->slug;
            $thisRoute->props->taxonomy_name = $tax_name;
            $thisRoute->props->post_types = $term_post_types;
              //TODO: Consider adding term-id?

              //Export
            if( $add_route ){
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;
            }

            //Add Route:
            // Just the Term, no Post => /tax/term archive. Should likely be a redirect.
            $add_route = true;
            $thisRoute=new stdClass();
              $thisRoute->name = 'TaxonomyTerm-'.'?'.'-'.ucwords($term->slug);
              $thisRoute->path = "/".$term->slug."/";
              $thisRoute->component=$this->template_name_cleanup('archive');
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = 'post';  //BUG: ??
            $thisRoute->props->term_slug = $term->slug;
            $thisRoute->props->taxonomy_name = $term->taxonomy;   //rewrite['slug'];
            $thisRoute->props->taxonomy_id = $term->taxonomy_id;   //rewrite['slug'];
            $thisRoute->props->taxonomy_slug = $term->taxonomy;    //$term_tax->rewrite['slug'];
            $thisRoute->props->post_types = $term_post_types;
              //TODO: Consider adding term-id?

              //Export
            if( $add_route ){
                $routes[] = $thisRoute;
                $component_templates[] = $thisRoute->component;
                $thisRoute=null;
            }

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
        foreach ( $post_types  as $post_type ) {
            // DEFAULT ARCHIVE route:
            $thisRoute=new stdClass();
            $thisRoute->name = 'PostTypeTaxonomy-'.$post_type.'-post';
            $thisRoute->path = "/".$post_type."/:post_slug/";
            $thisRoute->component = $this->template_name_cleanup('post');
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_type = $post_type; //to deprecate
            $thisRoute->props->post_types = array($post_type);

              //Export
            $routes[] = $thisRoute;
            $component_templates[] = $thisRoute->component;
            $thisRoute=null;

            // Just Custom Post Type route: (Should likely redirect)
            $thisRoute=new stdClass();
            $thisRoute->name = 'PostTypeTaxonomy-'.$post_type.'-?';
            $thisRoute->path = "/".$post_type."/";
            $thisRoute->component = $this->template_name_cleanup('archive');
              //Add in extra meta
            $thisRoute->props = new stdClass();
            $thisRoute->props->default = true;
            $thisRoute->props->post_types = array($post_type);

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
            { "name":"Search-Archive-Paged", "path": "/search/:term_slug/page/:paged_index/", "component": "Search", "props": true},
            { "name":"Search-Archive", "path": "/search/:term_slug/", "component": "Search", "props": true},
            { "name":"Author-Archive-Paged", "path": "/author/:author_slug/page/:paged_index/", "component": "Author", "props": true},
            { "name":"Author-Archive", "path": "/author/:author_slug/", "component": "Author", "props": true},
            { "name":"Year-Archive-Paged", "path": "/:year/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "name":"Year-Archive", "path": "/:year/", "component": "ArchiveDate", "props": true},
            { "name":"Month-Archive-Paged", "path": "/:year/:month/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "name":"Month-Archive", "path": "/:year/:month/", "component": "ArchiveDate", "props": true},
            { "name":"Date-Archive-Paged", "path": "/:year/:month/:day/page/:paged_index/", "component": "ArchiveDate", "props": true},
            { "name":"Date-Archive", "path": "/:year/:month/:day/", "component": "ArchiveDate", "props": true}
            ]');

        $component_templates[] = "Search";
        $component_templates[] = "Author";
        $component_templates[] = "ArchiveDate"; //Month, Year?

        //json_decode hates this "ensure it's a number" regex:  ([\d]*)
        foreach($wp_defaults  as $i => $route){
            $wp_defaults[$i]->path = str_replace(array("/:year/", "/:month/", "/:day/", "/:paged_index/"),array("/:year([\d]*)/", "/:month([\d]*)/", "/:day([\d]*)/", "/:paged_index([\d]*)/"), $route->path);
        }


        // DEFAULT: Non-Parent Post
        //don't want this higher than the blog-post-home, nor /year/
        $component_name = "page";  //TODO: front-page!
        $thisRoute=new stdClass();
        $thisRoute->path='/:post_slug';
        $thisRoute->component=$this->template_name_cleanup($component_name);
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
