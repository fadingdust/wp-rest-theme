
var mixins = {
  methods: {
      findObjectByKey: function(array, key, value) {
          for (var i = 0; i < array.length; i++) {
              if (array[i][key] === value) {
                  return array[i];
              }
          }
          return null;
      },
      post_id: function( post ){
        return "post-"+post.id;
      },
      post_classes: function( post ){
        let classes = "";
        if( post.format ) classes+=" post-format-"+ post.format;
        if( post.type ) classes+=" post-type-"+post.type;
        return classes;
      },
      updateHTMLTitle(pageTitle) {
          document.title = (pageTitle ? pageTitle + ' - ' : '') + wp.site_name;
      },

      linkToRouterLink(){
          console.log("linkToRouterLink", jQuery(".post-list article").length , jQuery( "#app-root  a[href^='"+wp.base_url+"'], #app-root  a[href^='/']:not([href*='#'])"  ));

          const $vm = this;

          jQuery( "#app-root a[href^='"+wp.base_url+"'], #app-root  a[href^='/']:not([href*='#'])"  ).addClass("vue-route-able");

          // Watch for any links pulled in from WP articles, etc.
          jQuery( "a[href^='"+wp.base_url+"'], a[href^='/']:not([href*='#'])"  ).on("click", function(event){
              event.preventDefault();


            //Decide which route:
              let linkPath = ( jQuery(this).attr("href").indexOf(wp.base_url) > -1) ? jQuery(this).attr("href").replace(wp.base_url,'/') : jQuery(this).attr("href").replace(wp.base_path,'/');


              console.log("Clicked a link-to-router-link (globals)!", linkPath.replace("//","/"));

            // Actually change the path now:
              $vm.$router.push( linkPath.replace("//","/")  );
          });

      }


  }

}

export default mixins;
