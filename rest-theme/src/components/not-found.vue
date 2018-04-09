<template>

    <div class="alert alert-warning"><p>Nothing was found matching this request.</p></div>

</template>
<style>
.alert p{margin:0 auto;}
</style>


<script>
import Mixin from '../globals.js';

export default {
    mixins: [Mixin],

    props: {
            slug: {
                type: String,
                default() {
                    return "";
                }
            },
        },

    mounted(){
     if(this.slug)  this.updateHTMLTitle( this.slug+" Not Found"); //TODO:  404?
    }
}

</script>
