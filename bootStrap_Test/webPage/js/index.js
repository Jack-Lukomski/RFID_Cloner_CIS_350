
//THIS IS WHAT IS WORKING
/*
How it works:
this javascript code uses "promises", which are objects that are basically incomplete, waiting to finish exicuting. 
That is why "await" is used in front of all the "navigator.xxxx" functions. This allows many of these to run 
at the same time without blocking.

*can send and receive data when using multiple test function. but when using independent functions it breaks after first send. then disconnects.



*/

//GLOBAL VARIABLES: simplifies using functions with HTML
let cloner;
let server;
let service;
//UUID's for characteristics for cloner, one for transmit data, one for receive, one for command to scan
let write_badge_to_cloner_ID = "0000180f-0000-1000-8000-000000000001";
let receive_badge_from_cloner_ID = "0000180f-0000-1000-8000-000000000002";
let scan_badge_command = "0000180f-0000-1000-8000-000000000003";
//encoder and decoder for converting byte data into strings
decoder = new TextDecoder();
encoder = new TextEncoder();
//characteristics for accessing remote cloner and transferring data
let cloner_transmit_characteristic;
let cloner_receive_characteristic;
let cloner_scan_command_characteristic;
//variables for sending and receiving data
let cloner_to_web_data;
let web_to_cloner_data;





//FUNCTIONS



//gets cloner connected to website and gets all characteristics
async function connect_to_cloner(){
    //device find
    cloner = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['battery_service']
  });

//connect to cloner peripheral
console.log('Connecting to Cloner Peripheral...');
server = await cloner.gatt.connect();
//get cloner service
console.log('Getting main service...');
service = await server.getPrimaryService('battery_service');

//get characteristics from cloner. these characteristics will link to buttons in website. they will each serve as different command for device
console.log('Getting characteristics');
cloner_transmit_characteristic = await service.getCharacteristic(receive_badge_from_cloner_ID);
cloner_receive_characteristic = await service.getCharacteristic(write_badge_to_cloner_ID);
cloner_scan_command_characteristic = await service.getCharacteristic(scan_badge_command);

console.log("DONE!");
}


//send badge number to cloner
async function send_data_to_cloner(){
    try{
    //let new_RFID_UID = document.getElementById("text_box").value;
    let val = document.getElementById("text_box").value;
    //convert to byte array
    byte_buff = await encoder.encode(val);
    await cloner_receive_characteristic.writeValue(byte_buff);
    }
    catch(error){}
    
    

}

//get badge from cloner
async function receive_data_from_cloner(){
    //read cloner characteristic
    cloner_to_web_data = await cloner_transmit_characteristic.readValue();
    console.log(decoder.decode(cloner_to_web_data));
    
}

//commands cloner to scan badge
function cloner_command_scan(){

}



/**
* Function to store an RFID code in local storage.
* Attempts to handle errors.
* @param {string} code - The RFID code to store.
*/
function storeRFIDCode(code) {
let existingCodes;

try {

    existingCodes = localStorage.getItem('rfidCodes')
    existingCodes = existingCodes ? JSON.parse(existingCodes) : [];

} catch (error) {

    existingCodes = []
}

existingCodes.push(code);

try {

    localStorage.setItem('rfidCodes', JSON.stringify(existingCodes));
} catch (error) {

    console.error('Failed to save RFID code: ', error);
}
}

/**
 * Function to retrieve all stored RFID codes from local storage.
 * Attempts to handles errors.
 * @returns {Array} - An array of stored RFID codes
 */
function retrieveAllCodes() {
    let existingCodes;

    try {
        if (typeof localStorage !== 'undefined') {
            existingCodes = localStorage.getItem('rfidCodes');
            existingCodes = existingCodes ? JSON.parse(existingCodes) : [];
        } else {
            existingCodes = []
        }
    } catch (error) {
        existingCodes = [];
        console.error('Failed to retrieve RFID codes: ', error);
    }

    return existingCodes
}


/*
* Start Bootstrap - Simple Sidebar v6.0.6 (https://startbootstrap.com/template/simple-sidebar)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-simple-sidebar/blob/master/LICENSE)
*/
window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});





//**************Old functions not in use ************************/



async function test_multiple_characteristics(){

    //device find
     cloner = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
    
    
    console.log('Connecting to Cloner Peripheral...');
    server = await cloner.gatt.connect();
    
    console.log('Getting main service...');
    service = await server.getPrimaryService('battery_service');
    
    console.log('Getting Battery Level Characteristic...');
    //const characteristics = await service.getCharacteristics(); multiple characteristics (not using at moment)
    //get characteristics from cloner. these characteristics will link to buttons in website. they will each serve as different command for device
    cloner_transmit_characteristic = await service.getCharacteristic(receive_badge_from_cloner_ID);
    cloner_receive_characteristic = await service.getCharacteristic(write_badge_to_cloner_ID);
    cloner_scan_command_characteristic = await service.getCharacteristic(scan_badge_command);
    
    // let rx_data = (await cloner_receive_characteristic.readValue()).getUint8();
    // let scan_now = (await cloner_scan_command_characteristic.readValue()).getUint8();
    //while(true){
    cloner_to_web_data = await cloner_transmit_characteristic.readValue();
    console.log(decoder.decode(cloner_to_web_data));
    //}
    
    while(true){
        let new_RFID_UID = "so we do it";
        await cloner_receive_characteristic.writeValue(encoder.encode(new_RFID_UID)); 
    }
    
    }

    

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