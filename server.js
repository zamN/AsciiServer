var net = require('net');
var util = require('util');
var _ = require('underscore');
var hat = require('hat');

var clients = [];

// client listener
var server = net.createServer(function(c) {
  console.log('client connected');
  var client_id = hat();
  var user;
  var message = "";
  c.on("data", function(data) {
    message += data.toString();
    console.log(message);
    if (message.indexOf('\t') !== -1 || message.indexOf('\n') !== -1) {
      if (contains(client_id) != true) {
        user = validate_user(message, c, client_id);
        if (user != undefined) {
          clients.push(user);
          c.write('SUCCESS\t');
        }
        else {
          c.end();
        }
      }
      else {
        eval_command(message, user);
      }
      message = "";
    }
    //console.log(clients);
  });

  c.on("end", function() {
    clients = remove_client(client_id);
    //console.log(clients);
  });
});

// starts the server
// listens:
server.listen(6789, function() { 
  console.log('server started');
});

function validate_user(data, con, client_id) {
  data_arr = sanitize_arr(data);
  console.log(data_arr);
  if (data_arr[0].toUpperCase() === "CONNECT")
    if (data_arr.length === 2)
      return {user: data_arr[1], connection: con, id: client_id, in_call: false}
}

function remove_client(client_id) {
  return (_.reject(clients, function(client) {
    return client.id === client_id
  }));
}

function contains(client_id) {
  return (_.where(clients, {id: client_id}).length > 0)
}

// Commands: CALL username
// Send: INCOMING username2
// Command: ACCEPT username2
// Command: DENY username2
// Command: SEND username message
function eval_command(command, user) {
  data_arr = sanitize_arr(command);
  switch(data_arr[0].toUpperCase()) {
    case "CALL":
      if (data_arr.length == 2) {
        send_user = get_user(data_arr[1]);
        if (send_user != undefined) {
          if (!send_user.in_call) {
            user.in_call = true;
            send_user.connection.write('INCOMING ' + user.user + '\t');
          }
        }
      }
      break;
    case "ACCEPT":
      if (data_arr.length == 2) {
        send_user = get_user(data_arr[1]);
        send_user.connection.write('SUCCESS\t');
        send_user.in_call = true;
        user.in_call = true;
      }
      break;
    case "DENY":
      if (data_arr.length == 2) {
        send_user = get_user(data_arr[1]);
        user.connection.write('DENIED\t');
        user.in_call = false;
        send_user.in_call = false;
      }
      break;
    case "SEND":
      if (data_arr.length >= 3) {
        send_user = get_user(data_arr[1]);
        if (send_user === undefined) {
          user.connection.end();
        }
        message = "";

        var i = 2;
        var no_tab = true;
        while (no_tab) {
          for (var j = 0; j < data_arr[i].length && no_tab; j++) {
            if (data_arr[i][j] != '\t')
              message += data_arr[i][j];
            else {
              message += '\t';
              no_tab = false;
            }
          }
          message += ' ';
          i += 1;
        }
      }
      send_user.connection.write(message + "\t");
      break;
  }
}

function sanitize_arr(str) {
  return str.replace(/\r*\n*\t*/g, '').split(' ');
}

function get_user(name) {
  return _.where(clients, {user: name})[0];
}
