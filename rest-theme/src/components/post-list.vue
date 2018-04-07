<style>
</style>

<template>
  <div class="post-list">
    <post-excerpt v-for="post in posts" :post="post" :isSingle="isSingle" :key="post.id"></post-excerpt>
  </div>
</template>

<script>

import PostExcerpt from '../components/post-excerpt.vue';

export default {
    components: {
      PostExcerpt
    },
    props: [
      'posts', 'isSingle'
    ],
    data() {
        return {

        }
    },
    created: function() {
      console.log("PostLists:", this.posts );
    },

}

</script>
