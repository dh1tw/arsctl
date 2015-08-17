settings = {
    webServer : {
        ip: "127.0.0.1", // normally doesn't need to be changed 
        port : 3000 // change as you wish
    }, 
    socketServer : {
        ip : "127.0.0.1", // normally doesn't need to be changed 
        port : 3001 // change as you wish
    },
    wintest : {
        port : 9871 
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
                parser: serialport.parsers.readline("\r\n")
            }
        },
        {
            name: "20m Yagi",
            device: "/dev/ars20",
            order: 1,
            band : ["20m"],
            wtAuto: true,
            tcpPort: 5001,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r\n")
            }
        }      
    ]
}