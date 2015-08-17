// *******************************************************************************************
// ** udplistener.js
// **
// ** A simple UDP Broadcast listener I needed for reverse-Engineering the Win-Test
// ** protocol
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************

var PORT = 9871;
var HOST = '0.0.0.0';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var server2 = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    // var buffer, i;
    // for (i = 0; i < message.length; i++) {
    //     console.log(message[i].toString(16));
    // }
});

server.bind(PORT, HOST);