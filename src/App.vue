<template>
  <div id="app">
    <button v-if="!isLogin" @click="login">登录</button>
    <div v-if="isLogin">
      你好：{{ this.userInfo.name }}
      <input v-model="content"/>
      <button @click="send">发送</button>
      <span>选择发送人：</span>
      <select v-model="sendId" @change="onSelectChange">
        <option v-for="item in (userInfo.friendsUser || [])" :key="item.id" :value="item.id">
          {{item.name + `：${item.online ? '在线' : '不在线'}`}}
        </option>
      </select>
    </div>
    <div v-if="isLogin">
      <div v-for="(item, index) in messages" :key="index">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
import fetch from 'axios'
export default {
  name: 'App',
  data () {
    return {
      isLogin: false, // 是否登录
      userInfo: {}, // 登录的用户信息
      content: '', // 发送内容
      sendId: '', // 发送人id
      messages: [] // 收到的消息内容
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
        this.userInfo = data
        this.creatChat(data.id)
      })
    },
    creatChat (id) {
      console.log(id)
      this.socket = io.connect(`http://localhost:8887`);
      // 发送给服务器认证身份
      this.socket.emit(`check`, id)
      // 监听服务器的消息
      this.socket.on(`message`, (data) => {
        // 遍历找出好友名
        let friendsUser = this.userInfo.friendsUser
        for(let i = 0; i < friendsUser.length; i++) {
          if (friendsUser[i].id === data.id) {
            let name = friendsUser[i].name
            switch (data.type) {
              case 0:  // 普通消息
                this.messages.push(`收到来自${name}的消息：${data.content}`)
                break;
              case 1: // 好友离线消息
                this.messages.push(`你的好友${name}已离线`)
                // 好友状态设置离线
                friendsUser[i].online = false
                break;
              case 2: // 好友在线消息
                this.messages.push(`你的好友${name}已上线`)
                // 好友状态设置在线
                friendsUser[i].online = true
                break;
              default:
                break;
            }
            break
          }
        }
        this.userInfo.friendsUser = friendsUser
      })
    },
    send () {
      if (this.sendId) {
        this.socket.emit(`send`, {
          id: this.sendId,
          content: this.content
        })
      } else {
        alert('请选择发送人')
      }
    },
    onSelectChange (e) {
      this.sendId = e.target.value
    }
  }
}
</script>

<style>
#app {
}
</style>
