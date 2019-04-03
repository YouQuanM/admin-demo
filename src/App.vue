<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
// import { mapActions } from 'vuex'
export default {
  name: 'App',
  // created () {
  //   this.getUser()
  // },
  methods: {
    // 获取用户信息
    // ...mapActions([
    //   'getUserInfo'
    // ]),
    // getUser () {
    //   this.getUserInfo().then(res => {
    //     // this.$router.push({
    //     //   name: this.$config.homeName
    //     // })
    //   })
    // }
  }
}
</script>

<style lang="less">
@import './assets/styles/reset.less';
html,body{
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
