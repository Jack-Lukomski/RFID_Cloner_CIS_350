






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
   
    if(characteristic.properties.notify){
        //infinate loop needs to be replaced with event triggered by "notifications" from BLE
        while(true){
            val = await characteristic.readValue();
            document.getElementById("RFID_Badge_number").innerHTML = val.getUint8(0);
        }
        
    }
    else {
        window.alert("your bluetooth device doesnt have notifications enabled!");
    }
    
    console.log("done");

    
}



