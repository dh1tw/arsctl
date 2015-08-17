// *******************************************************************************************
// ** rotatormock.js
// **
// ** This library is mocks a rotator. Since I didn't have enough rotators available
// ** during development I wrote this library to provide a "virtual rotator"
// **
// ** The RotatorMock can be connected to ARSCTL with the help of socat
// ** see: http://stackoverflow.com/questions/52187/virtual-serial-port-for-linux
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************


var fs = require("fs");

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; //localize object constructor

options = {
    baudrate: 57600,
    parser: serialport.parsers.readline("\n")
}

SerialPort.prototype.posititon = 0;
SerialPort.prototype.turn = 0;



// load rotator settings from file
var myConfigFile = "mockconfig.js";
eval (fs.readFileSync(myConfigFile, encoding="ascii"));

// Factory to generate Rotator objects
function RotorFactory(){}
RotorFactory.prototype.createRotor = function createRotor(id){
    myRotator = new SerialPort(settings.rotators[id].device, settings.rotators[id].options);
    myRotator.name = settings.rotators[id].name;
    myRotator.order = settings.rotators[id].order;
    myRotator.rotate = null;
    myRotator.isOpen = false;

    return myRotator;
}

var myRotorFactory = new RotorFactory();

var rotorObjs = []; //storage for rotator objects

//create rotator objects as specified in settings file

function containsRotator(name, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].name == name) {
            return true;
        }
    }
    return false;
}

function createRotators(){
    for (var i =0, l=settings.rotators.length; i < l; i++){
        if (containsRotator(settings.rotators[i].name, rotorObjs) == false){
            var rotorObj = myRotorFactory.createRotor(i);
            AddRotorListeners(rotorObj);
        }
    }
    for (var i=0; i<rotorObjs.length; i++){
        console.log("rotorObjs containing: " + rotorObjs[i].name)
    }
}

setTimeout(createRotators, 1000);
setInterval(createRotators, 10000);

var myTimer; 

function AddRotorListeners(obj){
    obj.on("open", function(error){
        if (error){
            console.log("Error: Can't open Port of "+ obj.name  + ": " + error);
        }
        else{
    
            obj.on("data", function(data){
                console.log(obj.name + "Rcv: " + data);
                if (data.match(/[M][0-9]{1,3}/)){
                    obj.turn = data.replace("M", "");
                    if (obj.rotate != null){
                        clearInterval(obj.rotate);
                    }                    
                    if (obj.posititon < obj.turn){
                        obj.rotate = setInterval(function(){
                            if (obj.posititon < obj.turn){
                                obj.posititon += 1;
                                sendHeading(obj.posititon, obj);
                            }
                        }, 150)
                    }
                    else if (obj.posititon > obj.turn){
                        obj.rotate = setInterval(function(){
                            if (obj.posititon > obj.turn){
                                obj.posititon -= 1;
                                sendHeading(obj.posititon, obj);
                            }
                        }, 150)
                    }
                }
                else if (data.match(/[C]/,"i")){
                    sendHeading(obj.posititon, obj);
                }
            })
            obj.on("close", function(error){
                console.log("Closing: " + obj.name);
                removeRotator(obj);
            })
            // obj.on("error", function(error){
            //     console.log("Error1: " + obj.name);
            //     obj.close();
            // })
            console.log("successfully connected Rotator: " + obj.name);
            obj.isOpen = true;
            addRotator(obj);
            rotorObjs.push(obj);
            sendHeading(obj.posititon, obj);
        }
    });
    obj.on("error", function(error){
        console.log(obj.name + " Error2: " + error);
        if (error.toString().match("Serialport not open")){
            
        }
        else{
            obj.close();            
        }
    })
}

function removeRotator(obj){
    obj.isOpen = false;

    var index = rotorObjs.indexOf(obj);
    console.log("removing : " + obj.name + " at index: " + index);
    if (index > -1){
        rotorObjs.splice(index, 1);
    }
}

function ping(){
    for (var i = 0; i<rotorObjs.length; i++){
        if (rotorObjs[i].isOpen == true){
             rotorObjs[i].write("ping\r\n");   
        }
    }
}

setInterval(ping, 1000);



function addRotator(obj){
}

function sendHeading(heading, obj){
    obj.write("?>+0"+heading+"\r\n");
}

function compare(a,b) {
  if (a.order < b.order)
     return -1;
  if (a.order > b.order)
    return 1;
  return 0;
}

