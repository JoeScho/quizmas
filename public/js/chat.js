const socket = io();
let currentAnswer;
let timestamp;
let gameInProgress = false;
let isNextQuestionActive = false;
let counter;
let questionCount;
let allUsers = [];


const setAnswer = (answer, event) => {
  $('.response').removeClass('response-selected');
  $(event.target).addClass('response-selected');
  timestamp = Date.now();
  return currentAnswer = answer;
}

socket.on('timesup', ({ answer, list, questionId }) => {
  socket.emit('answer', { answer: currentAnswer, questionId, timestamp }, function (err) {
    currentAnswer = null;
    isNextQuestionActive = true;
    $('.next-question').removeClass('disabled');

    if (err) {
      alert(err);
    }
  });

  Object.keys(list.answers).forEach(response => {
    jQuery(`#answer-${response}`).addClass(
      answer !== response ? 'wrong' : 'correct'
    );
  });
});

function populateQuestion({ question, answers }, time) {
  document.querySelector('#logo').classList.toggle('image-spin');
  setTimeout(() => document.querySelector('#logo').classList.toggle('image-spin'), 1000);
  // questionCount++;

  isNextQuestionActive = false;
  $('.next-question').addClass('disabled');
  const element = jQuery('#daquestion').children();

  const countdown = element.first().next();
  const countdownChildren = countdown.children();

  let timeLeft = time - 1000;
  clearInterval(counter);

  countdown.show();
  countdownChildren.first().text(time / 1000);
  countdownChildren.last().text(time > 1000 ? 'seconds' : 'second');

  counter = setInterval(() => {
    countdownChildren.first().text(timeLeft / 1000);
    countdownChildren.last().text(timeLeft > 1000 ? 'seconds' : 'second');
    timeLeft -= 1000;

    if (timeLeft < 0) {
      clearInterval(counter);
      countdownChildren.first().empty();
      countdownChildren.last().empty();
      element.first().next().hide();
    }
  }, 1000);

  element.first().next().next().text(question);
  element.last().empty();

  Object.keys(answers).forEach(id => {
    const button = jQuery('<button></button>')
      .attr('id', `answer-${id}`)
      .addClass('response')
      .click(event => setAnswer(id, event))
      .text(answers[id]);

    element.last().append(button)
  });

  jQuery('#daquestion').removeClass('hidden');
}

function startGame() {
  //questionCount = 0;
  console.log('starting game');
  socket.emit('startGame', {}, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error starting game');
      $('.start-button').addClass('hidden');
      $('.next-question').removeClass('hidden');
    }
  });
}

function restartGame() {
  //questionCount = 0;
  console.log('restarting game');
  socket.emit('startGame', {}, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error starting game');
      gameInProgress = false;
      $('.restart-button-container').addClass('hidden');
      $('.next-question').removeClass('hidden');
      $('.chat__main').removeClass('hidden');
      $('.chat__sidebar').removeClass('quiz-over');
      $('.chat__sidebar img').removeClass('leaderboard-img');
    }
  });
}

function nextQuestion() {
  if (!isNextQuestionActive) {
    return;
  }
  socket.emit('server:nextQuestion', {}, function (err) {
    if (err) {
      alert(err);
    } else {
    }
  });
}

socket.on('client:nextQuestion', function (question, time) {
  populateQuestion(question, time);
});

socket.on('quiz-over', function () {
  quizOver();
});

function quizOver() {
  console.log('Quiz Over');
  gameInProgress = false;
  $('.chat__main').addClass('hidden');
  $('.chat__sidebar').addClass('quiz-over');
  $('.chat__sidebar img').addClass('leaderboard-img');

  const me = getMyUser(allUsers, socket.id);
  if (me.admin && !gameInProgress || window.localStorage.getItem("admin")) {
    $('.restart-button-container').removeClass('hidden');
  }
}

function scrollToBottom() {
  //Selectors
  const messages = jQuery('#messages');
  const newMessage = messages.children('li:last-child');
  //Heights
  const clientHeight = messages.prop('clientHeight');
  const scrollTop = messages.prop('scrollTop');
  const scrollHeight = messages.prop('scrollHeight');
  const newMessageHeight = newMessage.innerHeight();
  const lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
};

const getMyUser = (users, myUserId) =>
  users.find(user => user.id === myUserId)

socket.on('connect', function () {
  const params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    document.querySelector('#logo').classList.toggle('image-spin');
    setTimeout(() => document.querySelector('#logo').classList.toggle('image-spin'), 1000);
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('gameStarted', function (question, time) {
  populateQuestion(question, time);
});


socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
  allUsers = users;

  const me = getMyUser(users, socket.id);
  if (me.admin && !gameInProgress || window.localStorage.getItem("admin")) {
    $('.start-button-container').removeClass('hidden');
    gameInProgress = true;
  }

  const ol = jQuery('<ul></ul>');

  users.sort(({ points: user1pts }, { points: user2pts }) => user2pts - user1pts);

  const winningAmount = users[0].points || -1;

  users.forEach(user => {
    const positionClass = winningAmount === user.points ? 'winning' : '';
    const nerdClass = user.admin ? 'nerd' : '';
    const span = `<span class="user-name ${positionClass} ${nerdClass}"></span>`;
    const name = jQuery(span).text(`${user.name}`);
    const points = jQuery('<span class="user-points"></span>').text(`${user.points}`);
    ol.append(jQuery('<li class="user-box"></li>').append(name, points));
  });

  jQuery('#users').html(ol);
});

socket.on('newMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('h:mm a');
  const template = jQuery('#message-template').html();
  const html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  const formattedTime = moment(message.createdAt).format('h:mm a');
  const template = jQuery('#location-message-template').html();
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  })

  jQuery('#messages').append(html);
  scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  const messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('');
  });
});


