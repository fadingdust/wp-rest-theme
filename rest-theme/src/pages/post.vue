<style>
article footer{
  border-top: 1px solid #ddd;
}

.entry-meta>p{
  display:inline-block;
  margin: 10px 10px 0 0;
}

article img{
  max-width: 100%;
  height: auto;
}
</style>

<template>
    <article :id="( post_id(this_post)) " :class="( post_classes(this_post) )" v-if="(this_post.id > 0)">

        <h1 class="entry-title" v-if="isSingle">{{ this_post.title.rendered }}</h1>
        <h2 class="entry-title" v-else><router-link :to="( this_post.permalink_path )">{{ this_post.title.rendered }}</router-link></h2>

        <div class="entry-content" v-if="isSingle" v-html="this_post.content.rendered"> </div>
        <div class="entry-content" v-else v-html="this_post.excerpt.rendered"> </div>

        <footer>
          <div class="entry-meta">
          <!--
            <p class="author-info"><span>Written by</span>
              <span class="author" v-if="(this_post.author_object)">
                <router-link :to="{ path: this_post.author_object.permalink_path }">{{this_post.author_object.nickname}}</router-link>
              </span>
            </p>

            <p class="date-info"><span>on</span>
              <span class="date" v-if="(this_post.date_rendered)">
                <router-link :to="{ path: this_post.date_archive.path }">{{this_post.date_rendered}}</router-link>
              </span>
            </p>

            <p class="category-list"><span>in categories</span>
              <span class="category" v-for="category in this_post.categories_list" v-bind:key="category.id">
                <router-link :to="{ path: category.permalink_path }">{{category.name}}</router-link>
              </span>
            </p>
            -->

          </div>
        </footer>

    </article>
</template>

<script>
    import WordpressService from '../services/wordpress';
    import Mixin from '../globals.js';

    export default {
        mixins: [Mixin],

        props: {
            post_slug: { type: String },
            post_type: { type: String },
            post: {
                type: Object,
                default() {
                    return {
                        id: 0,
                        permalink_path: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                    }
                }
            }
        },

        data: function() {
            return {
                loading: true,
                error: false,
                base_path: wp.base_path,
                isSingle: false,
                this_post: {
                        id: 0,
                        permalink_path: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                }
            }
        },

        created: function() {
            if (!this.post.id) {
                let post_type = this.post_type;
                if (!this.post_type) post_type = 'post';

                let post_slug = this.post_slug;
                if (!this.post_slug) post_slug = this.$route.params.post_slug;

                this.getPost(post_type, post_slug);
                this.isSingle = true;

            }else{  // Likely an Excerpt in an Archive
                this.this_post = this.post;
            }

        },

        methods: {
            getPost: function(post_type, post_slug) {
                const wpPromisedResult = WordpressService.getPostBySlug( post_type, post_slug );
                wpPromisedResult.then(result => {
                      console.log("PostSlug Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("PostSlug Found, no data");
                      }else{
                          this.this_post = result.posts[0];
                      }

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("PostSlug Error!", wpPromisedResult);
                  });
            }
        }

    }
</script>
