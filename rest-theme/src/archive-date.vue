<style>

</style>

<template>
    <div class="posts ">
        <Post v-for="post in posts" :post="post" :key="post.id"></Post>
    </div>
</template>

<script>
    export default {
        props: ['year','month'],
        mounted() {
            this.getPosts();
        },

        data() {
            return {
                posts: []
            }
        },

        methods: {
            getPosts() {

                //TODO: Check if month > 0
                let thisMonthDate=this.year+"-"+this.month+'-01 00:00:00';
                let nextMonthDate=this.year+"-"+this.month+'-31 00:00:00'; //yes. works for Feb!

                this.$http.get(wp.root + "wp/v2/post?after="+thisMonthDate+"&before="+nextMonthDate).then(function(response) {
                    this.posts = response.data;
                    this.$emit('page-title', '');
                }, function(response) {
                    console.log(response);
                });
            }
        }
    }
</script>
