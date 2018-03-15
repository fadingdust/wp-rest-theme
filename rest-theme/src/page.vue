<style>

</style>

<template>
    <div class="page">
        <h1 class="entry-title">{{ page.title.rendered }}</h1>

        <div class="entry-content" v-html="page.content.rendered">
        </div>
    </div>
</template>

<script>
    export default {
        props: ['post_slug'],

        data() {
            return {
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
            getPage() {
                this.$http.get(wp.root + 'wp/v2/page/?slug=' + this.post_slug).then(function(response) {

                    if( response.data.length == 0 ){
                      this.page.title.rendered = "Not Found";
                      this.page.content.rendered = "We could not find anything that matched this request.";

                    } else {
                      this.page = response.data[0];
                      this.$emit('page-title', this.page.title.rendered);
                    }

                }, function(response) {
                    console.log(response);
                });
            }
        },

        route: {
            canReuse() {
                return false;
            }
        }
    }
</script>
