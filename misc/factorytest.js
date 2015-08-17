// *******************************************************************************************
// ** factorytest.js
// **
// ** Tests I wrote for implementing a Factory Object for SerialPort objects.
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************



var serialport = require("serialport");
var SerialPort = serialport.SerialPort; //localize object constructor

// Factory to generate SerialPort objects
function SerialPortFactory(){}
SerialPortFactory.prototype.createSP = function createNewSerialPort(device){
    var mySerialPort = new SerialPort(device);
    mySerialPort.isOpen = false;
    return mySerialPort;
}

var myFactory = new SerialPortFactory();

mySerialPorts = []; //storage for open SerialPort objects

var myDevices = ["/dev/ttys009", "/dev/ttys011", "/dev/ttys013", "/dev/ttys015"]

function containsSp(device, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].path === device) {
            return true;
        }
    }

    return false;
}


function createSP(){
    for (var i =0, l=myDevices.length; i < l; i++){
        if (containsSp(myDevices[i], mySerialPorts) == false){
            var spObj = myFactory.createSP(myDevices[i]);
            AddSpListeners(spObj);            
        }
    }
}

setInterval(createSP, 3000);


function AddSpListeners(obj){
    obj.on("open", function(error){
        if (error){
            console.log("Error: Can't open Port of "+ obj.port.comName  + ": " + error);
        }
        else{
            console.log("successfully connected: " + obj.path);
            obj.isOpen = true;
            mySerialPorts.push(obj); // push into Array of open ports

            obj.on("data", function(data){
                console.log("data received [" + obj.path + "] " + data);

            })
            obj.on("close", function(error){
                console.log("Closing: " + obj.path);
                obj.isOpen = false;
                removeSp(obj);
            })
            obj.on("error", function(error){
                console.log("Error1: " + obj.path);
                obj.isOpen = false;

            })
        }
    });
    obj.on("error", function(error){
        console.log(obj.path + ": " + error);
        obj.isOpen = false;
        removeSp(obj);
    })
}


function removeSp(obj){
    for (var i = 0; i<mySerialPorts.length; i++){
        if (mySerialPorts[i] === obj){
            mySerialPorts.splice(i, 1);
        }
    }
}
// createSPs(); // let's create the SerialPort objects


setInterval(function(){
    for (i=0, l=mySerialPorts.length; i<l; i++ ){
        var obj = mySerialPorts[i];
    }

    for (i=0, l=mySerialPorts.length; i<l; i++ ){
        var obj = mySerialPorts[i];
        var device = obj.path;
        if (obj.isOpen == true){
            console.log("writing to " + device);
            obj.write("x");
            // obj.write("x", function(err, res, self){
            //     if (err){
            //         if (self){
            //             self.close();
            //         }
            //         else{
            //             console.log("Port not available?");
            //         }

                    // console.log("Write Error " + self.path + " " + err);
                // }
            // })
        }
    }

    // for (i=0, l=mySerialPorts.length; i<l; i++ ){
    //     var obj = mySerialPorts[i];
    // }

}, 1000)