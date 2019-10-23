<template>
  <div id="app">
    <button v-if="!isLogin" @click="login">登录</button>
    <div v-if="isLogin">
      登录成功
      <input v-model="content"/>
      <button @click="send">发送</button>
    </div>
  </div>
</template>

<script>
import fetch from 'axios'
export default {
  name: 'App',
  data () {
    return {
      isLogin: false,
      userInfo: {},
      content: ''
    }
  },
  mounted () {
  },
  methods: {
    login () {
      let options = {
        url: '/api/login',
        headers: { 'Content-Type': 'application/json' }
      }
      fetch(options).then(res => {
        this.isLogin = true
        const { data } = res
        console.log(data)
        this.userInfo = data
        this.creatChat(data.id)
      })
    },
    creatChat (id) {
      console.log(id)
      this.socket = io.connect(`http://localhost:8887`);
      this.socket.emit(`check`, id)
      this.socket.on(`message`, function (data) {    
        console.log(data)
      })
    },
    send () {
      this.socket.emit(`send`, {
        id: this.userInfo.friends[0],
        content: this.content
      })
    }
  }
}
</script>

<style>
#app {
}
</style>
