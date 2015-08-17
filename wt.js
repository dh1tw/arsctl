// *******************************************************************************************
// ** wt.js
// **
// ** This libaray handles the parsing and creating of Win-Test (rotator) messages for ARSCTL. 
// ** 
// **
// ** (c) Tobias Wellnitz (DH1TW), 2015
// ********************************************************************************************


exports.decodeMsg = function (msg){

    var bandMappingRev = {1: "160m", 2:"80m", 3:"40m", 4:"30m", 5:"20m", 6:"17m", 7:"15m", 8:"12m", 9:"10m"}

    var wtMsg = {};
    
    var originalMsg = msg;
    var frameType;
    var fromStation;
    var toStation;
    var data;
    var selector;
    var antenna;
    var band;
    var rotator;
    var heading;
    
    try{
        var frameType = msg.match("[A-Z]+:")[0];
        msg = msg.replace(frameType, "");
        frameType = frameType.replace(":", "");
        wtMsg["frameType"] = frameType;
    
        var fromStation = msg.match(/["][\w\d\s]{0,}["]/i)[0];
        msg = msg.replace(fromStation, "");
        fromStation = fromStation.replace(/["]/g, '');
        wtMsg["fromStation"] = fromStation;

        var toStation = msg.match(/["][\w\d\s]{0,}["]/i)[0];
        msg = msg.replace(toStation, "");
        toStation = toStation.replace(/["]/g, '');
        wtMsg["toStation"] = toStation;

        var data = msg.substring(0, msg.length-1); //chop off checksum
    
        if (frameType == "SETAZIMUTH"){

            var selector = data.match(/["][\w\d\s]{0,}["]/i)[0];
            data = data.replace(selector, "");
            selector = selector.replace(/["]/g, '');
            wtMsg["selector"] = selector;
    
            if (selector == "ANTENNA"){
                var antenna = data.match(/["][\w\d\s\W]{0,}["]/i)[0];
                data = data.replace(antenna, "");
                antenna = antenna.replace(/["]/g, '');
                wtMsg["antenna"] = antenna;
            }
            else if(selector == "AUTO"){
                var band = data.match(/[ ][0-9][ ]/)[0];
                data = data.replace(band, "");
                band = band.replace(/[^0-9]/g, '');
                wtMsg["band"] = bandMappingRev[band];
            }

            else if(selector == "ROTATOR"){
                var rotator = data.match(/["][\w\d\s\W]{0,}["]/i)[0];
                data = data.replace(rotator, "");
                rotator = rotator.replace(/["]/g, '');
                wtMsg["rotator"] = rotator;
            }

        
            var heading = data.match(/[0-9]{1,3}/)[0];
            wtMsg["heading"] = heading;
        }
        
    }
    catch(err){
        // console.log("Can't decode Win-Test Message -> " + originalMsg + " throwing -> " + err);
        
        wtMsg = null;
    }    
    return wtMsg;
}