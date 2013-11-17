var net = require('net');
var util = require('util');
var _ = require('underscore');

var clients = [];

// client listener
var server = net.createServer(function(c) {
  console.log('client connected');
  c.on("data", function(data) {
    console.log(data.toString());
    user = validate_user(data.toString(), c);
    if (user != undefined) {
      clients.push(user);
      c.write('SUCCESS\n');
    }
    else {
      c.end();
    }
    //console.log(clients);
  });

  c.on("end", function() {
    console.log('sum1 disc bb');
    clients = remove_client(c);
    console.log(clients);
  });
});

// starts the server
// listens:
server.listen(9337, function() { 
  console.log('server started');
});

function validate_user(data, con) {
  data = data.replace(/\r\n/g, '');
  data_arr = data.split(' ');
  if (data_arr[0].toUpperCase() === "CONNECT")
    if (data_arr.length === 2)
      return {user: data_arr[1], connection: con}
}

function remove_client(c) {
  console.log('im here');
  temp = [];
  _.map(clients, function(client) {
    if (client.connection != c)
      temp.push(client);
  });
  return temp;
}
