#!/usr/bin/env node

var http = require('http');
var url = require('url');
var server = http.createServer(function(req, res) {
    // Usage of endpoint: http://myhost.com/?message=my_message
    // Where my_message is the string to forward to all subscribed clients (through WS)
    var queryObject = url.parse(req.url, true).query;
    console.log((new Date()) + ' New request received with query:', queryObject);

    if (queryObject && queryObject.message) {
        // Relay the message through websockets
        var message = queryObject.message;
        sendMessageToAllClients(message, clients);

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Received message: ' + message);
    } else {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('No message received.');
    }
});

var portNumber = process.env.PORT || 5000;
server.listen(portNumber, function() {
    console.log((new Date()) + ' Server is listening on port ' + portNumber);
});

var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(r){
    // Code here to run on connection
    var connection = r.accept('echo-protocol', r.origin);

    // Specific id for this client & increment count
    var id = count++;
    // Store the connection method so we can loop through & contact all clients
    clients[id] = connection

    console.log((new Date()) + ' Connection accepted [' + id + ']');

    // Create event listener
    connection.on('message', function(message) {

        // The string message that was sent to us
        var msgString = message.utf8Data;
        console.log("Received message", msgString);

        // Loop through all clients
        for(var i in clients){
            // Send a message to the client with the message
            clients[i].sendUTF(msgString);
        }
    });

    connection.on('close', function(reasonCode, description) {
        delete clients[id];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

});

var count = 0;
var clients = {};
