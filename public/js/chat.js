const socket = io();
let currentAnswer;
let timestamp;
let gameInProgress = false;

const setAnswer = (answer, event) => {
  $('.response').removeClass('response-selected');
  $(event.target).addClass('response-selected');
  timestamp = Date.now();
  return currentAnswer = answer;
}

socket.on('timesup', ({ answer, list, questionId }) => {
  socket.emit('answer', { answer: currentAnswer, questionId, timestamp }, function (err) {
    currentAnswer = null;

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

function populateQuestion({ question, answers }) {
  const element = jQuery('#daquestion').children();
  element.first().text(question);
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
  console.log('starting game');
  socket.emit('startGame', {}, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error starting game');
      // $('.start-button-container').addClass('hidden');
    }
  });
}

function nextQuestion() {
  console.log('next question');
  socket.emit('server:nextQuestion', {}, function (err) {
    if (err) {
      alert(err);
    } else {
    }
  });
}

socket.on('client:nextQuestion', function (question) {
  populateQuestion(question);
});

socket.on('quiz-over', function () {
  alert('quiz-over')
});

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
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('gameStarted', function (question) {
  populateQuestion(question);
});


socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
  const me = getMyUser(users, socket.id);
  if (me.admin && !gameInProgress) {
    $('.start-button-container').removeClass('hidden');
    gameInProgress = true;
  }

  const ol = jQuery('<ul></ul>');

  users.sort(({ points: user1pts }, { points: user2pts }) => user2pts - user1pts);

  const winningAmount = users[0].points || -1;

  users.forEach(user => {
    const positionClass = winningAmount === user.points ? 'winning' : '';
    const span = `<span class="user-name ${positionClass}"></span>`;
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
