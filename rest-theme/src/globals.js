
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
  }

}

export default mixins;
