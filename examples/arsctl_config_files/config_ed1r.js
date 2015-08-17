// *******************************************************************************************
// ** config_ed1r.js
// **
// ** This is and example configuration file for ARSCTL. 
// ** 
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************

settings = {
    webServer : {
        ip: "127.0.0.1", // normally doesn't need to be changed 
        port : 80 // change as you wish
    }, 
    socketServer : {
        ip : "127.0.0.1", // normally doesn't need to be changed 
        port : 4001 // change as you wish
    },
    wintest : {
        port : 9871,
        send: "255.255.255.255",
        rcv: "0.0.0.0"
    },
    rotators : [
        {
            name: "10m Yagi",
            device: "/dev/ars10",
            order: 1,
            band : ["10m"],
            wtAuto: true,
            tcpPort: 5001,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r")
            }
        },
        {
            name: "15m Yagi",
            order: 2,
            band : ["15m"],
            wtAuto: true,
            device: "/dev/ars15",
            tcpPort: 5002,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r")
            }
        },
        {
            name: "20m Yagi",
            order: 3,
            band : ["20m"],
            wtAuto: true,
            device: "/dev/ars20",
            tcpPort: 5003,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r")
            }
        },
        {
            name: "40m Yagi",
            order: 4,
            band : ["40m"],
            wtAuto: true,
            device: "/dev/ars40",
            tcpPort: 5004,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r")
            }
        },
        {
            name: "OB11-3",
            order: 5,
            band : ["10m", "15m", "20m"],
            wtAuto: false,
            device: "/dev/arsOB11",
            tcpPort: 5005,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r")
            }
        }
    ]
}