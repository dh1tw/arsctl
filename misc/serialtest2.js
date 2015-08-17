// *******************************************************************************************
// ** serialtest2.js
// **
// ** Tests I wrote for implementing the SerialPort library.
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************


var serialport = require("serialport");
var SerialPort = serialport.SerialPort; //localize object constructor

// Factory to generate SerialPort objects
function SerialPortFactory(){}
SerialPortFactory.prototype.createSP = function (device){
    var mySerialPort = new SerialPort(device,{baudrate: 57600});
    mySerialPort.isOpen = false;
    return mySerialPort;
}

var myFactory = new SerialPortFactory();

var mySerialPorts = []; //storage for open SerialPort objects

var myDevices = ["/dev/ttys006", "/dev/ttys008", "/dev/ttys012", "/dev/ttys015"]

var mytempDevices = [];

function containsSp(path, array) {
    var i;
    for (i = 0; i < array.length; i++) {
        if (array[i].path == path) {
            return true;
        }
    }
    return false;
}

function createSPs(){
    for (var i=0; i < myDevices.length; i++){
        
        if (containsSp(myDevices[i], mySerialPorts) == false){ //check if Serialport object already exists
            var obj = myFactory.createSP(myDevices[i]); // create new instance of Serialport
            // mytempDevices.push(obj);
            
            obj.on("open", function(error){
                if (error){
                    console.log("Error: Can't open Port of "+ this.path  + ": " + error);
                    // obj = null;
                }
                else{
                    console.log("successfully opened: " + this.path);
                    this.isOpen = true;

                    //Add eventhandlers to the opened port
                    obj.on("data", function(data){
                        console.log("data received [" + this.path + "] " + data);
                    })
                    obj.on("close", function(error){
                        console.log("Closing: " + this.path);
                        this.isOpen = false;
                        removeSp(this);
                    })
                    obj.on("error", function(error){
                        this.isOpen = false;
                        console.log("Error: " + this.path);
                        this.close();
                    })
                    mySerialPorts.push(obj); // push into Array of open ports
                    // var index = mytempDevices.indexOf(obj);
                    //
                    // if (index > -1){
                    //     mytempDevices.splice(index, 1);
                    // }
                }
            });
            
            obj.on("error", function(error){
                console.log("Obj Error " + this.path + " " + error);
                // obj = null;
            })          
        }                
    }
}
        
        // for (var i=0; i < mySerialPorts.length; i++){
        //     if (mySerialPorts[i].path == myDevices[i].path){
        //         var obj = mySerialPorts[i];
        //         if (obj.isOpen == false){ //if closed, try to open it
        //             obj.open(function(error){
        //                 if (error){
        //                     console.log("Error: Can't open Port of "+ obj.path  + ": " + error);
        //                 }
        //                 else{
        //                     console.log("successfully opened: " + obj.path);
        //                     obj.isOpen = true;
        //                     mySerialPorts.push(obj); // push into Array of open ports
        //
        //                     //Add eventhandlers to the opened port
        //                     obj.on("data", function(data){
        //                         console.log("data received [" + obj.path + "] " + data);
        //                     })
        //                     obj.on("close", function(error){
        //                         console.log("Closing: " + obj.path);
        //                         obj.isOpen = false;
        //                         removeSp(obj);
        //                     })
        //                     obj.on("error", function(error){
        //                         obj.isOpen = true;
        //                         console.log("Error: " + obj.path);
        //                         obj.close();
        //                     })
        //                 }
        //             });
        //         }
        //     }
        // }                 
//     }
// }

createSPs();
// setInterval(createSPs, 5000); //check every 5ec if ports are available; if so, open them



function removeSp(obj){
    for (var i=0, l=mySerialPorts.length; i<l; i++ ){
        if (obj.path == mySerialPorts[i].path){
            mySerialPorts.splice(i, 1); //remove Serialport from list of connected ports
        }
    }    
}


//send a string to all open serial ports every 5sec 
setInterval(function(){

    for (var i=0, l=mySerialPorts.length; i<l; i++ ){
        var obj = mySerialPorts[i];
        var device = obj.path;
        
        if (obj.isOpen){
            obj.write("x");
            // obj.write("x", function(err, res, self){
            //     if (err){
            //         console.log("Write Error: " + err);
            //         self.close();
            //     }
            // });
        }
    }

}, 5000)