<template>
  <div id="app">
    <button v-if="!isLogin" @click="login">登录</button>
    <div v-if="isLogin">
      登录成功
    </div>
  </div>
</template>

<script>
import fetch from 'axios'
export default {
  name: 'App',
  data () {
    return {
      isLogin: false
    }
  },
  mounted () {
  },
  methods: {
    login () {
      fetch({ url: '/api/login' }).then(res => {
        this.isLogin = true
        this.creatChat()
      })
    },
    creatChat () {
      this.socket = io.connect('http://localhost:8887');     
      this.socket.on('message', function (data) {    
        console.log(data)
      })
    }
  }
}
</script>

<style>
#app {
}
</style>
