<style>
</style>

<template>
  <div class="post-list" >
    <post-excerpt v-for="post in posts" :post="post" :isSingle="isSingle" :key="post.id" v-if="typeof post == 'object'"></post-excerpt>
  </div>
</template>

<script>
/**
 * Entirely plausible to have this do the pagination.
 *
 */
import PostExcerpt from '../components/post-excerpt.vue';

import Mixin from '../globals.js';

export default {
    mixins: [Mixin],

    components: {
      PostExcerpt
    },
    props: {
      'posts': { type: Array },
      'isSingle': { type: Boolean },  //prime candidate to be moved into a state store like VueX
    },
    data() {
        return {

        }
    },


    updated: function(){
console.log("App Updated:");
          this.linkToRouterLink();
        this.$nextTick(function () { // Handy function for all children updates

          this.linkToRouterLink();
console.log("App Updated:next-tick:");

        });
    },

}


</script>
