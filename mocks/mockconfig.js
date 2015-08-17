// *******************************************************************************************
// ** mockconfig.js
// **
// ** Configuration file for a Rototor Mockup
// **
// ** This file does not implement any functionality needed by ARSCTL.
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************


settings = {
    rotators : [
        {
            name: "10m Yagi",
            device: "/dev/ttys004",
            order: 1,
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\n")
            }
        },
        {
            name: "15m Yagi",
            order: 2,
            device: "/dev/ttys007",
            options : {
                baudrate: 57600,
                parser: serialport.parsers.readline("\r\n")
            }
        },
        // {
        //     name: "20m Yagi",
        //     order: 3,
        //     device: "/dev/ttys012",
        //     options : {
        //         baudrate: 57600,
        //         parser: serialport.parsers.readline("\r\n")
        //     }
        // },
        // {
        //     name: "40m Yagi",
        //     order: 4,
        //     device: "/dev/ttys014",
        //     options : {
        //         baudrate: 57600,
        //         parser: serialport.parsers.readline("\r\n")
        //     }
        // },
        // {
        //     name: "OB11-3",
        //     order: 5,
        //     device: "/dev/ttys016",
        //     options : {
        //         baudrate: 57600,
        //         parser: serialport.parsers.readline("\r\n")
        //     }
        // }
        

    ]
}