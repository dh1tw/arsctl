// *******************************************************************************************
// ** serialtest.js
// **
// ** Tests I wrote for implementing the SerialPort library.
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************



var serialport = require("serialport");
var SerialPort = serialport.SerialPort; //localize object constructor


var mySp = new SerialPort("/dev/ttys011");
addListeners(mySp);


function testSerial(){
    setTimeout(function(){
        console.log("writing...");
        mySp.write("hello\n\r");
    }, 3000)

    setTimeout(function(){
        mySp.close();
    }, 3500)

    setTimeout(function(){
        mySp = null;
        mySp = new SerialPort("/dev/ttys009");
        addListeners(mySp);    
    }, 4000)    
}

// setTimeout(function(){
//     mySp.write("x");
// }, 7000)

setInterval(function(){
    testSerial();
}, 6000)

function addListeners(obj){
    obj.on("open", function(error){
        if (error){
            console.log("Error: Can't open Port of "+ obj.path  + ": " + error);
        }
        else{
            console.log("successfully connected: " + obj.path);

            obj.on("data", function(data){
                console.log("data received [" + obj.path + "] " + data);

            })
            obj.on("close", function(error){
                console.log("Closing: " + obj.path);
            })
            obj.on("error", function(error){
                console.log("Error1: " + obj.path);

            })
            obj.write("x");
        }
    });
    obj.on("error", function(error, self){
        console.log(obj.path + ": " + error);
    })
}
