// *******************************************************************************************
// ** App.js
// **
// ** This is the main Application for ARSCTL. 
// ** 
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************



// *******************************************************************************************
// ** Serialport Setup  
// **
// ** SerialPort is used to communicate with the Yaesu Compatible rotators
// ** e.g. EA4TX's Antenna Rotator System (ARS) 
// ** see: http://www.ea4tx.com
// **
// ********************************************************************************************

var serialport = require("serialport"); 
var SerialPort = serialport.SerialPort; //localize object constructor

// *******************************************************************************************
// ** Filesystem Setup 
// **
// ** We also need access to the local file system to load the configuration file
// ** please set the path of your config file accordingly. The Config file is a
// ** Javascript file, containing a config object in JSON notation.
// **
// ** e.g. /etc/arsctl/arsctl.js
// **
// ** With this app, several examples are provided (config.js or /examples/ars_config_files)
// **
// ********************************************************************************************

var fs = require("fs");

// load rotator settings from file
// var myConfigFile = "/etc/arsctl/config.js";
var myConfigFile = "./config.js";
eval (fs.readFileSync(myConfigFile, encoding="ascii"));

// *******************************************************************************************
// ** Web Framework Setup 
// **
// ** HTML Request handling, routing, cookie handling, etc. is done with Express
// ** see: http://expressjs.com
// ** 
// ** As a HTML Template Engine, Jade is used
// ** see: http://jade-lang.com
// ********************************************************************************************

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
// var users = require('./routes/users'); // no users implemented yet

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// app.use('/users', users); // no users implemented yet

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// *******************************************************************************************
// ** Error handlers
// **
// ** Make sure you have different Error handlers for Development and Production
// **
// ** Development / Production environment can be set via Node Env (defaults to 'development')
// ********************************************************************************************

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

// *******************************************************************************************
// ** UDP Broadcast to Win-Test Network
// **
// ** This part is only needed if you want to share/control the rotators on/from the Win-Test
// ** Network; Win-Test is a Amateur Radio Contest Software. For more see: 
// ** http://www.win-test.com
// **
// ********************************************************************************************

var wtSEND = "255.255.255.255";
var wtPORT = settings.wintest.port;
var wtRCV = "0.0.0.0";
var dgram = require('dgram');
var wtUDP = dgram.createSocket('udp4');
wtUDP.bind(function(){
    wtUDP.setBroadcast(true);    
}); 

var wtUDPListener = dgram.createSocket('udp4');
wtUDPListener.on('listening', function(){
    var address = wtUDPListener.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
})

wtUDPListener.bind(wtPORT, wtRCV);
wtUDPListener.on('message', handleUDPMsg);

//load the Win-Test Message handler
var wt = require("./wt.js");

//TBD: this function should relocated into a separate file in order to de-clutter the main App
function handleUDPMsg(message){
    message = message.toString();
    var msg = wt.decodeMsg(message);
    if (msg){
        if(msg.frameType == 'SETAZIMUTH'){
            var heading = pad(msg.heading);
            console.log(msg.heading);
            for (var i=0, l=rotorObjs.length; i < l; i++){
                if(msg.selector == "AUTO"){
                    if (rotorObjs[i].wtAuto == true){
                        var index = msg.band.indexOf(rotorObjs[i].band);  //see this this antenna supports the band
                        if (index > -1){
                            rotorObjs[i].preSet = heading;
                            if (rotorObjs[i].isOpen){
                                rotorObjs[i].write("M" + heading + "\r\n");
                            }
                        }                        
                    }
                }
                else if (msg.selector == "ANTENNA"){
                    var name = rotorObjs[i].name;
                    var isOpen = rotorObjs[i].isOpen;
                    if (name == msg.antenna){
                        if (isOpen){
                            rotorObjs[i].preSet = heading;
                            rotorObjs[i].write("M" + heading + "\r\n");
                        }
                    }
                    else if (msg.antenna.match(name)){ //hack for Win-Test - remove "Band Prefix"
                        if (name.replace(/[0-9]{1,3}[M\s]/, "") == name){
                            if (isOpen){
                                rotorObjs[i].preSet = heading;
                                rotorObjs[i].write("M" + heading + "\r\n");
                            }
                            
                        }
                    }
                }
                else if (msg.selector == "ROTATOR"){
                    var name = rotorObjs[i].name;
                    var isOpen = rotorObjs[i].isOpen;
                    if (name == msg.rotator){
                        if (isOpen){
                            rotorObjs[i].preSet = heading;
                            rotorObjs[i].write("M" + heading + "\r\n");
                        }
                    }
                }
            }
        }
    }
}


// *******************************************************************************************
// ** Web Interface
// **
// ** Since serveral users can connect to this software, or the antenna direction might be
// ** changed through the manual controller, it is necessary to periodically inform all
// ** connected users about the position of the antennas.
// ** 
// ** We use Socket.io to handle the Server->Client communication. Socket.io is cross-browser
// ** and provides transparently serveral ways to keep the connection between the server
// ** and the client open (Websockets, Long Polling, ...etc) 
// ** see: http://socket.io
// ** 
// ********************************************************************************************

// Load the TCP Library
net = require('net');


// setup socketio server
var http = require('http');
var socketServer = http.createServer(function(socket){
    socket.on("error", function(err){
       console.log(err);
       console.log("error");
    });
}).listen(settings.socketServer.port);

var io = require('socket.io').listen(socketServer);
var ROTATORS = "rotators"; // #define Socket.io Room

// *******************************************************************************************
// ** Rotator Factory
// **
// ** Since we want to be able to handle a arbitray amount of rotators, I've implemented
// ** a RotatorFactory (Factory Design Pattern).
// ********************************************************************************************

var rotorObjs = []; //this Array stores all instanciated rotator objects


function RotorFactory(){}
RotorFactory.prototype.createRotor = function createRotor(id){
    var myRotator = new SerialPort(settings.rotators[id].device, settings.rotators[id].options);
    myRotator.name = settings.rotators[id].name;
    myRotator.order = settings.rotators[id].order;
    myRotator.heading;
    myRotator.preSet;
    myRotator.band = settings.rotators[id].band;
    myRotator.wtAuto = settings.rotators[id].wtAuto;
    myRotator.isOpen = false;
    myRotator.tcpPort = settings.rotators[id].tcpPort;
    myRotator.tcpServer;

        
    return myRotator;
}

var myRotorFactory = new RotorFactory();



//helper function
function containsRotator(name, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].name == name) {
            return true;
        }
    }
    return false;
}

//Now create rotator objects as specified in settings file and start a listener
function createRotators(){
    for (var i =0, l=settings.rotators.length; i < l; i++){
        if (containsRotator(settings.rotators[i].name, rotorObjs) == false){
            var rotorObj = myRotorFactory.createRotor(i);
            AddRotorListeners(rotorObj);
        }
    }
    // for (var i=0; i<rotorObjs.length; i++){
    //     console.log("rotorObjs containing: " + rotorObjs[i].name)
    // }
}

// allow the program to start for a second before we start creating the rotator objects
setTimeout(createRotators, 1000); 

// check every 10 seconds if a new rotator has been connected
setInterval(createRotators, 10000);


// *******************************************************************************************
// ** Rotator (SerialPort) Listener
// **
// ** This functions implements the SerialPort listeners and handles all serial port events
// ** like open, close, data...etc
// ** 
// ** In case that a rotator get's disconnected for whatever reason, the program terminates.
// ** When High RF is in the shack, or badly shielded USB cables are used, the rotators might
// ** disconnect without intention. Therefore it is important to properly handle also the
// ** disconnection of the Rotators.
// ** Currently it is recommended to run this program daemonized so that it will
// ** respawn automatically; The /examples folder contains an Upstart (Ubuntu) example configuration
// **
// ** However a removeRotator() handler has been included. The intention was always to handle
// ** disconnects of serial / usb devices properly within the software. Unfortunately, due to some
// ** bugs in the SerialPort library (status November 2014), the SerialPort library was not
// ** able to close the serial / usb connections properly.
// **
// ********************************************************************************************

function AddRotorListeners(obj){
    
    obj.on("open", function(error){
        if (error){
            console.log("Error: Can't open Port of "+ obj.name  + ": " + error);
        }
        else{
            console.log("successfully connected Rotator: " + obj.name);

            obj.on("data", function(data){
                // console.log("data received [" + obj.name + "] " + data);
                handleRotatorInput(obj, data);
            })
            obj.on("close", function(error){
                obj.tcpServer.close();
                console.log("Disconnected: " + obj.name);
                throw new Error("USB disconnected");                
                // removeRotator(obj);
            })
            // obj.on("error", function(error){
            //     console.log("Error1: " + obj.name);
            //     obj.close();
            // })
            addRotator(obj);
            obj.isOpen = true;
            obj.tcpServer = createTcpServer(obj);               
            rotorObjs.push(obj);
            
            obj.tcpServer.on("error", function(e){
                if (e.code == "EADDRINUSE"){
                    console.log(obj.name + ": Socket port " + obj.tcpPort + "already in use!!");
                    throw new Error(obj.name + ": Socket port " + obj.tcpPort + " already in use!!");
                }
            })
            
        }
    });
    obj.on("error", function(error){ //Serial Port error handler
        // throw new Error("USB disconnected");
        console.log(obj.name + " Error2: " + error);
        if (error.toString().match("Serialport not open")){
            
        }
        else{
            obj.close();            
        }
    })
}

// *******************************************************************************************
// ** Handling rotator data
// **
// ** This function handles the incomming data from the serial port 
// ** bascially the data get parsed, checked and then set through the socket to Webclients
// ** and through a UDP Broadcast to the Win-Test Clients
// ** 
// ********************************************************************************************

function handleRotatorInput(rotator, data){
    if (data.match(/\+[0-9]{1,4}/)){
        data = data.match(/[0-9]{1,3}$/)[0]; //remove "?>+0" of "?>+0123" --> make 3 digit only
        // data = data.replace("?>+0", "");
        rotator.heading = pad(data.match(/[0-9]{1,3}/)[0]);
        var heading = rotator.heading;
        if (Math.abs(rotator.preSet - rotator.heading) > 3){  //add some threshold
            var message = { rotator : rotator.name, heading: heading, preSet:rotator.preSet};
        }
        else{
            var message = { rotator : rotator.name, heading: heading};
        }
        io.sockets.to(ROTATORS).emit("heading", message);
        if (rotator.band.length > 1){  // Win-Test only allows unique antenna names, therfore Band will be added as prefix 
            for (var i=0; i<rotator.band.length; i++){
                var band = rotator.band[i];
                broadcastWT('READAZIMUTH: "ROTATOR" "" "" "' + rotator.name + '" "'+ band + ' ' + rotator.name +'" '+ bandMapping[rotator.band[i]] + ' ' + rotator.heading+' '+rotator.heading);            
            }            
        }
        else{
            for (var i=0; i<rotator.band.length; i++){
                broadcastWT('READAZIMUTH: "ROTATOR" "" "" "' + rotator.name + '" "'+ rotator.name +'" '+ bandMapping[rotator.band[i]] + ' ' + rotator.heading+' '+rotator.heading);            
            }            
        }
    }
}

//TBD static bandmapping; this could be relocated into the config file
var bandMapping = {"160m": 1, "80m": 2, "40m": 3, "30m": 4, "20m": 5, "17m": 6, "15m": 7, "12m": 8, "10m": 9}

//calculate the Checksum for Win-Test Broadcast Message
function calcWinTestCheckSum(msg){
    var total = 0; 
    for (var i = 0; i < msg.length; i++){
        total += msg.charCodeAt(i);
    }
    total = total % 128;
    total += 128;
    total = total.toString(16); //convert into a string, representing the hex values
    return total
}

//broadcast a Win-Test Message
function broadcastWT(msg){
    var content = new Buffer(msg);
    var checksum = new Buffer(calcWinTestCheckSum(msg), "hex");
    var message = Buffer.concat([content, checksum]);
    wtUDP.send(message, 0, message.length, wtPORT, wtSEND, function(err, bytes) {
        if (err) throw err;
        // console.log('UDP message sent to ' + wtSEND +':'+ wtPORT);
        // wtUDP.close();
    });
}

// *******************************************************************************************
// ** Create TCP socket for each rotator
// **
// ** This function creates a TCP socket you can connect to and control directly the
// ** rotator. e.g. EA4TX's ARSVCOM http://www.ea4tx.com/arsvcom/
// ** 
// ** 
// ** Note: Only a subset of the Yaesu Protocol has been implemented.
// ** Find the Yaesu Protocol description here: 
// ** http://gatorradio.org/Manuals/Yaesu_GS-232B_Manual.pdf
// ********************************************************************************************

function createTcpServer(obj){
    var server = net.createServer(function (socket) {
            console.log(obj.name + ": Opening TCP Socket");
          // Handle incoming messages from clients.
          socket.on('data', function (data) {
            // console.log(obj.name + ": " + data);
            if (data=="C2\r\n"){ // Yaesu Protocol
                if(obj.heading){
                    // var heading = pad(parseInt(obj.heading)); //remove linebreaks by casting to Int
                    var heading = obj.heading;
                    socket.write("+0" + heading + "+0000\r\n");
                    // console.log("+0" + heading + "+0000\r\n");
                }
            }
            //stop rotator (A= azimuth only, S=all)
            else if ((data=="A\r\n") || (data=="S\r\n")){
                if(obj.heading){
                    var heading = obj.heading;
                    obj.preSet = heading;
                    obj.write("M"+ obj.preSet+"\r\n");
                }
            }
                        
            //set antenna to new position
            else if (String(data).match(/M[0-9]{1,3}/)){
                obj.preSet = pad(String(data).match(/[0-9]{1,3}/)[0]);
                obj.write("M"+ obj.preSet+"\r\n");
            }
          });

          // Remove the client from the list when it leaves
          socket.on('end', function () {
              console.log(obj.name + ": bye bye");
          });

          socket.on('error', function (e) {
              console.log(obj.name + ": Unhandled Error: " + e);
          });

    }).listen(obj.tcpPort);
    
    return server;
}

// When a new Rotator has been connected, all connected clients are informed
// so that they can instantiate a visual delegate for the new rotator object
function addRotator(obj){
    io.sockets.to(ROTATORS).emit("add", {rotator: obj.name, order: obj.order});
}

//Helper function
//create leading zeros to match 3 digit format
function pad(num) {
    var s = "000" + num;
    return s.substr(s.length-3);
}

// *******************************************************************************************
// ** Polling
// **
// ** We periodically poll the rotators (e.g. every second) for the current position. 
// ** Due to the asyncronous nature of Javascript, we just the command. The rotator's 
// ** answer is then handled by the appropriate listener we installed earlier for 
// ** each rotator (serialport)
// ** 
// ********************************************************************************************


//request azimuth of rotators
function pollStatus(){        

    for (var i=0, l = rotorObjs.length; i<l; i++){
        if (rotorObjs[i].isOpen == true){
            // console.log("polling: " + rotorObjs[i].name);
            rotorObjs[i].write("C\r\n");
        }
    }
};

//poll rotator every x milliseconds
setInterval(pollStatus, 1000);

//handler to remove the Rotator object and inform all connected clients
//this handler is currently not used due to some bugs in the SerialPort library (Nov 2014).
//instead this programs just terminates. Please deamonize it, so that it respawns automatically
function removeRotator(obj){
    obj.isOpen = false;

    io.sockets.to(ROTATORS).emit("remove", {rotator: obj.name});
    var index = rotorObjs.indexOf(obj);
    console.log("removing : " + obj.name + " at index: " + index);
    if (index > -1){
        rotorObjs.splice(index, 1);
    }
    
    for (i=0; i<rotorObjs.length; i++){
        console.log("in rotorObjs: " + rotorObjs[i].name);
    }
}

// helper function
function compare(a,b) {
  if (a.order < b.order)
     return -1;
  if (a.order > b.order)
    return 1;
  return 0;
}


//dirty hack; couldn't find another way to reference to the object which caused the error
//and will be consequentially deleted
var remove;


// *******************************************************************************************
// ** Socket.io handler
// **
// ** Implement socket.io handler
// ** basically we subscribe upon a new connection to the Room "Rotators" (which has been 
// ** defined in the variable ROTATORS).
// ** 
// ** Then we provide the Web client with a list of currently available rotators
// ** 
// ** Currently only one Command ("M" - Set Azimuth) is implemented. Whenever it is received
// ** from the webclient (through the socket) we iterate through the Array of connected 
// ** rotators until we've found it, and then we send the command to him.
// ** 
// ********************************************************************************************


io.on('connection', function (socket) {
    //subscribe to rotator Room
    socket.join(ROTATORS);

    //send list of currently available rotators
    for (i=0, l=rotorObjs.length; i<l; i++){
        addRotator(rotorObjs[i]);
    }
    //handle incoming commands from the WebClients
    socket.on("command", function(data){
        // console.log(data);
        for (var i=0, l=rotorObjs.length; i < l; i++){
            if (rotorObjs[i].name == data.rotator){
                rotorObjs[i].preSet = data.position;
                // console.log("M" + data.position + "\r\n");
                var result = rotorObjs[i].write("M" + data.position + "\r\n"); // send New Position Command to the Rotator
            }
        }
    })
    //test function Ping / Pong
    socket.on("ping", function(data){
        socket.emit("pong", "");
    })
})

