// 官方连接：https://socket.io/
const express = require('express');
const io = require('socket.io')(8887);
const app = express();

console.log('server start');

let userList = [
  { id: '1', name: '微微', friends: ['2', '3', '4', '5'], online: false, friendsUser: [] },
  { id: '2', name: '笑笑', friends: ['1', '3', '5'], online: false, friendsUser: [] },
  { id: '3', name: '甜甜', friends: ['1', '2', '4'], online: false, friendsUser: [] },
  { id: '4', name: '猪猪', friends: ['1', '3'], online: false, friendsUser: [] },
  { id: '5', name: '美美', friends: ['1', '2'], online: false, friendsUser: [] },
]

// 获取通过id获取指定用户的方法
// 第二个参设传了的话，可设置当前用户是否在线
function getUser (id, online) {
  let user
  for (let i = 0; i < userList.length; i++) {
    if (!id && userList[i].online === false) {
      user = { ...userList[i] }
      break
    }
    if (id && userList[i].id === id) {
      user = userList[i]
      if (online !== undefined) userList[i].online = online
    }
  }
  return user
}

app.get('/api/login', (req, res) => {
  // 找出第一个未在线的用户
  let user = getUser()
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
  let ID
  // 验证用户信息
  socket.on("check", function (id, callback) {
    ID = id
    console.log(`建立与${ID}的连接`)
    socketObj[ID] = socket
    // 并且通知他的好友，告诉他们该用户已经上线（只通知给在线的人）
    let friends = getUser(ID, true).friends
    for (let i = 0; i < friends.length; i++) {
      if (getUser(friends[i]).online && socketObj[friends[i]]) {
        socketObj[friends[i]].emit('message', {
          type: 2, // 上线通知
          id: ID
        })
      }
    }
  });

  //注册服务器的自定义事件
  socket.on("send", function (data, callback) {
    console.log(`服务器收到${ID}消息，发送给${data.id}`)
    if (socketObj[data.id]) {
      socketObj[data.id].emit(`message`, {
        type: 0, // 0：普通消息
        content: data.content,
        id: ID
      });
    }
  });
  
  //注册服务器的自定义事件
  socket.on("disconnect", function (data, callback) {
    console.log(`用户${ID}断开连接`)
    delete socketObj[ID]
    // 用户设置状态不在线
    let friends = getUser(ID, false).friends
    // 并且通知他的好友，告诉他们该用户已经离线（只通知给在线的人）
    for (let i = 0; i < friends.length; i++) {
      if (getUser(friends[i]).online && socketObj[friends[i]]) {
        socketObj[friends[i]].emit('message', {
          type: 1, // 离线通知
          id: ID
        })
      }
    }
  });
});

app.listen(8888, (err) => {
  if(err) {throw new Error(err);}
  console.log('*** server started ***');
});