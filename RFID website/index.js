var BLE_service;
var BLE_characteristic;
var BLE_device_name;
var BLE_data;
var connected_BLE_device;




//this function is just a test, needs to write RFID value to "RFID_Badge_number" in index.html
function write_html_val(){
    document.getElementById("RFID_Badge_number").innerHTML = "GOODBYE!";
}

function find_bluetooth(){
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'] // Required to access service later.
      })
      .then(device => { /* … */ })//promise waits for bluetooth device asynchronously
      .catch(error => { console.error(error);
                        window.alert("No bluetooth on device.") 
                    });
        
}




