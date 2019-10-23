// 官方连接：https://socket.io/
const express = require('express');
const io = require('socket.io')(8887);
const app = express();

console.log('server start');

let userList = [
  { id: '1', nickname: '张三', friends: ['2', '3'], online: false, friendsUser: [] },
  { id: '2', nickname: '李四', friends: ['1', '3'], online: false, friendsUser: [] },
  { id: '3', nickname: '王五', friends: ['1'], online: false, friendsUser: [] },
]

app.get('/api/login', (req, res) => {
  // 找出用户
  let user
  for (let i = 0; i < userList.length; i++) {
    if (userList[i].online === false) {
      user = {
        ...userList[i]
      }
      userList[i].online = true
      break
    }
  }
  // 找出好友
  if (user.friends) {
    for (let i = 0; i < userList.length; i++) {
      if (user.friends.indexOf(userList[i].id) !== -1) {
        let { friendsUser, ...friends } = userList[i]
        user.friendsUser = [
          friends,
          ...user.friendsUser
        ]
      }
    }
  } else {
    res.end(JSON.stringify(user))
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(user))
});


const socketObj = {} // 消息队列
io.on('connection', function (socket) {
  let id
  // 验证用户信息
  socket.on("check", function (data, callback) {
    console.log(`建立与${data}的连接`)
    socketObj[data] = socket
    id = data
  });
  //注册服务器的自定义事件
  socket.on("send", function (data, callback) {
    console.log(`服务器收到${id}消息，发送给${data.id}`)
    socketObj[data.id].emit(`message`, data.content);
  });
  
  //注册服务器的自定义事件
  socket.on("disconnect", function (data, callback) {
    console.log("断开连接")
    delete socketObj[id]
  });
});

app.listen(8888, (err) => {
  if(err) {throw new Error(err);}
  console.log('*** server started ***');
});