/* functions for general use*/

/* This function returns the value associated with 'whchParam' on the URL */
function getURLParameters(whichParam) {
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for(var i = 0; i < pageURLVariables.length; i++){
    var parameterName = pageURLVariables[i].split('=');
    if(parameterName[0] == whichParam) {
      return parameterName[1];
    }
  }
}

var username = getURLParameters('username');
if('undefined' == typeof username || !username){
  username = 'Anonymous_' +Math.random();
}

var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
  chat_room = 'lobby';
}

/******* Connect to the socket server ******/

var socket = io.connect();

/* what to do when the server sends a log essage */
socket.on('log',function(array){
  console.log.apply(console,array);
});

/* what to do when server responds that someone joined a room */
socket.on('join_room_response',function(payload){
  /* If the payload fails, display an alert with the message. */
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }

  /* If we are notified that we joined a room then ignore it */
  if (payload.socket_id == socket.id){
    return;
  }

  /* If someone joins, add new row to lobby table */
  var dom_elements = $('.socket_'+payload.socket_id);
  /* If we already have an entry for this person */
  if(dom_elements.length == 0){
    var nodeA = $('<div></div>');
    nodeA.addClass('socket_'+payload.socket_id);

    var nodeB = $('<div></div>');
    nodeB.addClass('socket_'+payload.socket_id);

    var nodeC = $('<div></div>');
    nodeC.addClass('socket_'+payload.socket_id);

    nodeA.addClass('w=100');

    nodeB.addClass('col-9 text-right');
    nodeB.append('<h4>'+payload.username+'</h4>');

    nodeB.addClass('col-3 text-left');
    var buttonC = makeInviteButton();
    nodeC.append(buttonC);

    nodeA.hide();
    nodeB.hide();
    nodeC.hide();
    $('#players').append(nodeA,nodeB,nodeC);
    nodeA.slideDown(1000);
    nodeB.slideDown(1000);
    nodeC.slideDown(1000);

  }
  else {

    var buttonC = makeInviteButton();
    $('.socket_'+payload.socket_id+' button').replaceWith(buttonC);
    dom_elements.slideDown(1000);

  }


  /* Manage the message that a new player has joined */
  var newHTML = '<p>'+payload.username+' just entered the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);
});

/* what to do when server says someone left */
socket.on('player_disconnected',function(payload){
  console.log('made it to checkpoint 0');
  /* If the payload fails, display an alert with the message. */
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  console.log('made it to checkpoint 1');
  /* If we are notified that we left a room then ignore it */
  if (payload.socket_id == socket.id){
    return;
  }

  console.log('made it to checkpoint 2');
  /* If someone leaves animate out all their content*/
  var dom_elements = $('.socket_'+payload.socket_id);

  console.log('made it to checkpoint 3', dom_elements);
  /* If something exists. */
  if(dom_elements.length != 0){
    dom_elements.slideUp(1000);
  }

  console.log('made it to checkpoint 4');
  /* Manage the message that a player has left */
  var newHTML = '<p>'+payload.username+' has left the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);

  console.log('made it to checkpoint 5');
});

socket.on('send_message_response',function(payload){
  /* If the payload fails, display an alert with the message. */
  if(payload.result == 'fail'){
    alert(payload.message);
    return;
  }
  /* If the payload succeeds, we add a message to the DOM. */
  $('#messages').append('<p><b>'+payload.username+' says:</b> '+payload.message+'</p>');
});

  function send_message() {
    var payload = {};
    payload.room = chat_room;
    payload.username = username;
    payload.message = $('#send_message_holder').val();
    console.log('*** Client Log Messsage: \'send essage\' payload: '+JSON.stringify(payload));
    socket.emit('send_message', payload);
  }

  function makeInviteButton() {
    var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    return(newNode);
  }


/* Runs when page loads */
$(function(){
  /* Defines values coming in from server payload */
  var payload = {};
  payload.room = chat_room;
  payload.username = username;

  console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
  /* Sending message to server saying we want to join a room. */
  socket.emit('join_room',payload);
});
