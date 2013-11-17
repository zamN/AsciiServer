var net = require('net');
var util = require('util');
var _ = require('underscore');
var hat = require('hat');

var clients = [];

// client listener
var server = net.createServer(function(c) {
  console.log('client connected');
  var client_id = hat();
  c.on("data", function(data) {
    // potential bottleneck~
    console.log(data.toString());
    console.log(contains(client_id));
    if (contains(client_id) != true) {
      console.log("i see this once");
      user = validate_user(data.toString(), c, client_id);
      if (user != undefined) {
        clients.push(user);
        c.write('SUCCESS\n');
      }
      else {
        c.end();
      }
    }
    else {
      eval_command(data.toString(), c);
    }
    console.log(clients);
  });

  c.on("end", function() {
    console.log('sum1 disc bb');
    clients = remove_client(client_id);
    console.log(clients);
  });
});

// starts the server
// listens:
server.listen(9337, function() { 
  console.log('server started');
});

function validate_user(data, con, client_id) {
  data_arr = sanitize_arr(data);
  if (data_arr[0].toUpperCase() === "CONNECT")
    if (data_arr.length === 2)
      return {user: data_arr[1], connection: con, id: client_id}
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
// Send: INCOMING username
// Command: ACCEPT username2
// Command: SEND username message
function eval_command(command, c) {
  if (parse_command(command) === undefined)
    return undefined;
  return "";
}

function parse_command(command, c) {
  data = sanitize_arr(command);
  switch(data[0].toUpperCase()) {
    case "CALL":
      console.log("call sent");
      break;
  }
}

function sanitize_arr(str) {
  return str.replace(/\r\n/g, '').split(' ');
}
