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

    <article :id="( post_id(this_post)) " :class="( post_classes(this_post) )" v-else-if="(this_post.id > 0)">

        <h1 class="entry-title" v-if="isSingle" v-html="this_post.title.rendered"></h1>
        <h2 class="entry-title" v-else="" ><router-link :to="( this_post.permalink_path )" v-html="this_post.title.rendered"></router-link></h2>

        <div class="entry-content" v-if="isSingle && this_post" v-html="this_post.content.rendered"> </div>
        <div class="entry-content" v-else-if="this_post.excerpt" v-html="this_post.excerpt.rendered"> </div>

        <footer>
          <div class="entry-meta">
            <span>Written </span>
            <p class="author-info" v-if="this_post.author_object && this_post.author_object.nickname"><span> by </span>
              <span class="author" >
                <router-link :to="{ path: this_post.author_object.permalink_path }">{{this_post.author_object.nickname}}</router-link>
              </span>
            </p>

            <p class="date-info"><span>on</span>
              <span class="date" v-if="this_post.date_rendered">
                <router-link :to="{ path: this_post.date_archive.path }">{{this_post.date_rendered}}</router-link>
              </span>
            </p>

            <p class="category-list" v-if="this_post.categories_list && this_post.categories_list.length > 0" ><span>in categories</span>
              <span class="category" v-for="category in this_post.categories_list" v-bind:key="category.id">
                <router-link :to="{ path: category.permalink_path }">{{category.name}}</router-link>&nbsp;
              </span>
            </p>

          </div>
        </footer>

    </article>
</template>

<script>
    import Mixin from '../globals.js';

    export default {
        mixins: [Mixin],

        props: {
            post_slug: { type: String },
            post_type: { type: String },
            isSingle: { type: Boolean },
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
                this_post: {
                        id: 0,
                        permalink_path: '',
                        title: { rendered: '' },
                        content: { rendered: '' }
                }
            }
        },

        created: function() {
//          this.post.content.rendered=this.post.excerpt.rendered.replace("read-more","read-more and-more");
//                this.post.content.rendered=this.post.content.rendered.replace("<a href=","<router-view :to");
//                this.post.content.rendered=this.post.content.rendered.replace("</a>","</router-view>");

                this.this_post = this.post;
        },

    }
</script>
