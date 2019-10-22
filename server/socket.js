// 官方连接：https://socket.io/
const express = require('express');
const io = require('socket.io')(8887);
const app = express();

console.log('server start');

let userList = [
  { id: 1, nickname: '张三', friends: [2, 3], online: false },
  { id: 2, nickname: '李四', friends: [1, 3], online: false },
  { id: 3, nickname: '王五', friends: [1], online: false },
]

app.get('/api/login', (req, res) => {
  // 找出用户
  let user
  for (let i = 0; i < userList.length; i++) {
    if (userList[i].online === false) {
      user = userList[i]
      userList[i].online = true
      break
    }
  }
  // 找出好友
  for (let i = 0; i < userList.length; i++) {
    if (user.friends.indexOf(userList[i].id) !== -1) {
      user.friendsUser = [
        userList[i],
        ...user.friendsUser
      ]
    }
  }
  res.end(user)
});
io.on('connection', function (socket) {
  //注册服务器的自定义事件
  socket.on("messgae", function (data, callback) {
    // socket.emit(data.id, data.content);
  });
});

app.listen(8888, (err) => {
  if(err) {throw new Error(err);}
  console.log('*** server started ***');
});