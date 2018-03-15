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
        props: ['postId'],
        mounted() {
            this.getPage();
        },

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

        methods: {
            getPage() {
                this.$http.get(wp.root + 'wp/v2/pages/' + this.postId).then(function(response) {
                    this.page = response.data;
                    this.$emit('page-title', this.page.title.rendered);
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
