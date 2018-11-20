var socket = io();
let currentAnswer;

const setAnswer = (answer, event) => {
  $('.response').removeClass('response-selected');
  $(event.target).addClass('response-selected');
  return currentAnswer = answer;
}

socket.on('timeup', ({ answer }) => {
  socket.emit('answer', { answer: currentAnswer }, function (err) {
    currentAnswer = null;

    if (err) {
      alert(err);
    }
  });

  jQuery('#answer-a')[0].classList.add('wrong');
  jQuery('#answer-b')[0].classList.add('wrong');
  jQuery('#answer-c')[0].classList.add('wrong');
  jQuery('#answer-d')[0].classList.add('wrong');
  jQuery(`#answer-${answer}`)[0].classList.remove('wrong');
  jQuery(`#answer-${answer}`)[0].classList.add('correct');
});

function populateQuestion({ question, answers }) {
  jQuery('#question')[0].textContent = question;

  jQuery('#answer-a')[0].textContent = answers.a;
  jQuery('#answer-b')[0].textContent = answers.b;
  jQuery('#answer-c')[0].textContent = answers.c;
  jQuery('#answer-d')[0].textContent = answers.d;

  jQuery('#daquestion')[0].hidden = false;
}

function startGame() {
  console.log('starting game');
  socket.emit('startGame', {}, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error starting game');
      $('.start-button-container').addClass('hidden');
    }
  });
}

function scrollToBottom() {
  //Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  //Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
};

const getMyUser = (users, myUserId) =>
  users.find(user => user.id === myUserId)

socket.on('connect', function () {
  var params = jQuery.deparam(window.location.search);

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
  if (me.admin) {
    $('.start-button-container').removeClass('hidden');
  }

  var ol = jQuery('<ul></ul>');

  users.sort(({ points: user1pts }, { points: user2pts }) => user2pts - user1pts);

  users.forEach((user) => {
    ol.append(jQuery('<li></li>').text(`${user.name}: ${user.points}`));
  });

  jQuery('#users').html(ol);
});

socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  })

  jQuery('#messages').append(html);
  scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function () {
    messageTextbox.val('');
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
