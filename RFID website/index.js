
//THIS IS WHAT IS WORKING
/*
How it works:
this javascript code uses "promises", which are objects that are basically incomplete, waiting to finish exicuting. 
That is why "await" is used in front of all the "navigator.xxxx" functions. This allows many of these to run 
at the same time without blocking.

Issues
# right now this code read the characteristic in a while loop which runs infinately.This must be replaced 
by an event. Specifically notifications must cause the javascript code to update the value shown in the website. 

#speghetti code must be cleaned up. 
*/
async function test(){
    //device find
    let device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
    document.getElementById("bluetooth_device_name").innerHTML = device.name;

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();
    
    console.log('Getting Battery Service...');
    const service = await server.getPrimaryService('battery_service');
    
    console.log('Getting Battery Level Characteristic...');
    const characteristic = await service.getCharacteristic('battery_level');
   
    //if characteristic has notifications enabled
    if(characteristic.properties.notify){
        //add event listener to characteristic, then if notification change val
        characteristic.addEventListener(
            "characteristicvaluechanged", 
            //aero function: event is an event listener. this could be replaced with "_" or blank. It only serves as placeholder
            async (event_handler) => {
                //print new val to web page
                val = await characteristic.readValue();
                document.getElementById("RFID_Badge_number").innerHTML = val.getUint8(0);
            }
        )
        //get updated characteristic if notification received
        await characteristic.startNotifications();
        
    }
    //you should have notifications enabled for live data!
    else {
        window.alert("your bluetooth device doesnt have notifications enabled!");
    }
    
    console.log("done");
}

/**
 * NEEDS TESTING!!!
 * 
 * This function is used to store an RFID code in the web storage (localStorage).
 * It checks if web storage is supported and stores the RFID code if supported, otherwiese
 * logs an error message.
 * 
 * @param {string} rfidCode - The RFID code to store
 */
function storeRFIDCode(rfidCode) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("rfidCode", rfidCode);
        console.log("RFID code stored successfully.");
    } else {
        console.log("Web Storage is not supported.");
    }
}

/**
 * NEEDS TESTING!!!
 * 
 * This function is used to retrieve all stored RFID codes from the web storage,
 * (localStorage).
 * It checks if web storage is supported, retrieves the stored RFID coes if available, and
 * returns them as an array.
 * If no RFID codes are found, it logs a message and returns an empty array.
 * 
 * @returns {Array} - An array containing all stored RFID codes.
 */
function getRFIDCodes() {
    if (typeof(Storage) !== "undefined") {
        var rfidCodes = localStorage.getItem("rfidCodes");
        if (rfidCodes) {
            return JSON.parse(rfidCodes);
        } else {
            console.log("No RFID codes found in storage.");
            return [];
        }
    } else {
        console.log("Web Storage is not supported.");
        return [];
    }
}