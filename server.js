const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { getQuestions } = require('./quiz.js');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();
const QUIZ = 'DAQZ';
const TIME_LIMIT = 5000

let questionIndex;
let questions
let questionTimestamp;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  let timeout;

  const startTimer = (answer, list, questionId) => {
    timeout = setTimeout(() => {
      io.to(QUIZ).emit('timesup', { answer, list, questionId });
    }, TIME_LIMIT)
  };

  socket.on('answer', (params, callback) => {
    const diff = questionTimestamp - params.timestamp;
    // console.log(`got answer ${params.answer} for ${JSON.stringify(users.getUser(socket.id))}`);
    const { correct } = questions[params.questionId];
    if(params.answer === correct) {
      users.addPoint(socket.id, TIME_LIMIT,diff );
      console.log(`correct answer for ${JSON.stringify(users.getUser(socket.id))}`);
    }

    io.to(QUIZ).emit('updateUserList', users.getUserList(QUIZ));

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
    socket.emit('newMessage', generateMessage('DAQZ', 'Welcome to DAQZ'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('DAQZ', `${params.name} has joined`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    const user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });

  // admin started game
  socket.on('startGame', (message, callback) => {
    questionIndex = 0;
    questions = getQuestions();
    const { correct, ...list } = questions[questionIndex];
    io.to("DAQZ").emit('gameStarted', list, TIME_LIMIT);
    questionTimestamp = Date.now();
    clearTimeout(timeout);
    startTimer(correct, list, questionIndex);
    callback();
  });

  socket.on('server:nextQuestion', (message, callback) => {
    questionIndex++;
    const question = questions[questionIndex];
    if(!question){
      io.to("DAQZ").emit('quiz-over');
      return callback();
    }
    const { correct, ...list } = question;
    io.to("DAQZ").emit('client:nextQuestion', list, TIME_LIMIT);
    questionTimestamp = Date.now();
    clearTimeout(timeout);
    startTimer(correct, list, questionIndex);
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    const user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
