<style>

</style>

<template>
<div class="page-wrapper">
    <main class="content">
        <div class="page" v-if="(error)">
          <h2>Not Found</h2>
        </div>

        <article class="page" v-else="(!error)">
            <h1 class="entry-title">{{ page.title.rendered }}</h1>

            <div class="entry-content" v-html="page.content.rendered">
            </div>
        </article>
    </main>

</div>
</template>

<script>
    import WordpressService from '../services/wordpress';

    export default {
        props: ['post_slug'],

        data() {
            return {
                loading: true,
                error: false,
                page: {
                    id: 0,
                    slug: '',
                    title: { rendered: '' },
                    content: { rendered: '' }
                }
            }
        },

        mounted() {
            this.getPage();
        },

        methods: {

            getPage: function() {

                const wpPromisedResult = WordpressService.getPageBySlug( this.post_slug );
                wpPromisedResult.then(result => {
                      console.log("PageSlug Found!", result.posts, result.totalPages);
                      this.loading = false;

                      if( result.posts.length == 0){
                          this.error = true; //alternate content control too
                          console.log("PageSlug Found, no data");
                      }else{
                          this.page = result.posts[0];
                      }

                  })
                  .catch(err => {
                    this.error = true;

                    console.log("PageSlug Error!", wpPromisedResult);
                  });
            }// getPage

        }

    }
</script>
