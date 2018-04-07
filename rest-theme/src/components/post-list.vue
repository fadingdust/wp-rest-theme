<style>
</style>

<template>
  <div class="post-list">
    <post-excerpt v-for="post in posts" :post="post" :isSingle="isSingle" :key="post.id"></post-excerpt>
  </div>
</template>

<script>
/**
 * Entirely plausible to have this do the pagination.
 *
 */
import PostExcerpt from '../components/post-excerpt.vue';

export default {
    components: {
      PostExcerpt
    },
    props: [
      'posts',
      'isSingle'  //prime candidate to be moved into a state store like VueX
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
