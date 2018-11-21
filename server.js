const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { questions } = require('./quiz.js');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
const QUIZ = 'DAQZ';

app.use(express.static(publicPath));


io.on('connection', (socket) => {
  console.log('New user connected');

  const startTimer = answer => {
    setTimeout(() => {
      io.to(QUIZ).emit('timeup', { answer });
    }, 5000)
  };

  socket.on('answer', (params, callback) => {
    console.log(`got answer ${params.answer} for ${JSON.stringify(users.getUser(socket.id))}`);
    const { correct } = questions[0];
    if(params.answer === correct) {
      users.addPoint(socket.id);
    }

    console.log(JSON.stringify(users.getUserList('DAQZ')))

    callback();
  });

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and quiz name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  // admin started game
  socket.on('startGame', (message, callback) => {
    const { correct, ...q1 } = questions[0];
    io.to("DAQZ").emit('gameStarted', q1);
    startTimer(correct);
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
