const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,'../public')
const {generateMessage,generateLocationMessage} =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log("new websocket connection ");
   socket.on('join',(options,callback)=>{
     const {error,user} = addUser({id:socket.id,...options})
     if(error) {
        return callback(error)
     }
       socket.join(user.room)

       socket.emit('messages',generateMessage('Admin','welcome'))
       socket.broadcast.to(user.room).emit('messages',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
       callback()
   })

 socket.on('message',(message,callback)=>{
    const user = getUser(socket.id) 
    const filter = new Filter()
     if(filter.isProfane(message)) {
         return callback('profanity not allowed')
     }    
    io.to(user.room).emit('messages',generateMessage(user.username,message))
     callback('Delivered')

 })
   
 socket.on('sendLocation',(coords,callback)=>{
     const user = getUser(socket.id)
         io.to(user.room).emit('Locationmessages',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


  socket.on('disconnect',()=>{
      const user =removeUser(socket.id)
      if(user) {
        io.to(user.room).emit('messages',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
      }
     
  })
   
})


server.listen(port,(req,res)=>{
    console.log(`server is up running on port ${port}`);
})