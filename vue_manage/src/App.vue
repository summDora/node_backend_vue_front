<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
export default {
  data() {
    return {
      islogin:false,
    }
  },
}
</script>
<style lang="scss">
html,body{
  overflow: hidden;
  margin: 0;
  padding: 0;
   width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
}
.ivu-menu-item-selected a{
  color: #3399ff !important;
}
.ivu-modal-footer{
  border-top: none !important;
}
.video .ivu-col{
  margin:5px 0px
}
  
</style>
