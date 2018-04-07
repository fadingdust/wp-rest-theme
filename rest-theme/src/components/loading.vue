<template>

    <div class="loading">

    </div>

</template>

<style>
.loading{
  background: url(../assets/loading-bar.gif) no-repeat center;
  height:100px;
  width:240px;
  position: absolute;
  margin-left:-120px;
  left: 50%;
}

.loading {
  opacity: 0;
  animation: fadeOut 1.2s linear backwards;
  animation-delay: .4s;
}

@keyframes fadeOut {
	0% 	{ opacity: 0;z-index:999999 }
	10% { opacity: 1; }
	90% { opacity: 1; transform: translateY(0px);}
	99% { opacity: 0; transform: translateY(-30px);}
	100% { opacity: 0;z-index:-1 }
}

</style>
