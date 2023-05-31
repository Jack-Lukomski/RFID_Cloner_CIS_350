/**
 * RFID Cloner project
 * 
 * Website controls and stores data from the cloner
 * 
 * 
 */

//GLOBAL VARIABLES: simplifies using functions with HTML
let cloner;
let server;
let service;

let write_badge_to_cloner_ID = 0x0001;
let receive_badge_from_cloner_ID = 0x0002;
let scan_badge_command = 0x0003;
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



//FUNCTIONS***********************************************************************************



//gets cloner connected to website and gets all characteristics
async function connect_to_cloner() {
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
    //service = await server.getPrimaryService('battery_service');
    service = await server.getPrimaryService('battery_service');

    //get characteristics from cloner. these characteristics will link to buttons in website. they will each serve as different command for device
    console.log('Getting characteristics');
    cloner_transmit_characteristic = await service.getCharacteristic(receive_badge_from_cloner_ID);
    cloner_receive_characteristic = await service.getCharacteristic(write_badge_to_cloner_ID);
    cloner_scan_command_characteristic = await service.getCharacteristic(scan_badge_command);
    //publish device name to website
    document.getElementById("bluetooth_device_name").innerHTML = cloner.name;
    //start notification services for cloner
    setup_RFID_notifications();
    console.log("DONE!");
}




//send badge number to cloner via button push
async function send_data_to_cloner() {
    try {
        //let new_RFID_UID = document.getElementById("text_box").value;
        let val = document.getElementById("text_box").value;
        //save custom UID to list of ID's
        storeRFIDCode(val);
        
        //convert to byte array
        byte_buff = await encoder.encode(val);
        await cloner_receive_characteristic.writeValue(byte_buff);
        console.log(byte_buff);//test
    }
    catch (error) {
        console.log(error.message);
    }

}




//read cloners characteristic via button push
async function receive_data_from_cloner() {

    //read cloner characteristic
    cloner_to_web_data = await cloner_transmit_characteristic.readValue();

    let val = decoder.decode(cloner_to_web_data);
    console.log(val);
    //store new badge to local storage
    storeRFIDCode(val);
    

    console.log(localStorage.getItem('rfidCodes'));//test to see if storage works
    //localStorage.removeItem('rfidCodes');//test only!

}




//start RFID cloner notification: this will start an event handler to autimaticaly listen for cloner data. automatically saves new data to JSON file
async function setup_RFID_notifications() {

    if (cloner_transmit_characteristic.properties.notify) {

        //get updated characteristic if notification received
        try {
            await cloner_transmit_characteristic.startNotifications();
        }
        catch (error) { }

        //add event listener to characteristic, then if notification change val
        cloner_transmit_characteristic.addEventListener(
            "characteristicvaluechanged",

            //aero function event listener activates when notification arrives
            async (event_handler) => {

                try {
                    val = event_handler.target.value;
                    val = decoder.decode(val);
                    document.getElementById("RFID_Badge_number").innerHTML = val;
                    //store UID to JSON data
                    storeRFIDCode(val);
                    
                }
                catch (DOMException) { }

                console.log(localStorage.getItem('rfidCodes'));//TEST
                console.log(val);

            }
        )
    }
}




//commands cloner to scan badge
async function cloner_command_scan() {

    try {
        //Cloner waits for data to arrive on this characteristic. Doesnt matter what the data is, just that it arrives.
        let data = await encoder.encode("writetoRFID_");
        await cloner_scan_command_characteristic.writeValue(data);
    }
    catch (error) { }
}




/**
 * Function to clear JSON data from web browser
 * takes no parameters
 */
function clear_saved_data() {
    localStorage.removeItem("rfidCodes");
    console.log("cleared");
    //clear drop down list 
    update_badge_list()
}




/**
 * Function to store an RFID code in local storage.
 * Attempts to handle errors.
 * @param {string} code - The RFID code to store.
 */
function storeRFIDCode(code) {
    let existingCodes;

    //retreive badge numbers from storage and put into array
    try {
        existingCodes = localStorage.getItem('rfidCodes')
        existingCodes = existingCodes ? JSON.parse(existingCodes) : [];
    }
    //if no list available, make new array
    catch (error) {
        existingCodes = []
    }

    //if new code not in list, add and save
    if (!existingCodes.includes(code)) {
        //add new code to the array of codes
        existingCodes.push(code);

        //save codes
        try {
            localStorage.setItem('rfidCodes', JSON.stringify(existingCodes));
        } catch (error) {

            console.error('Failed to save RFID code: ', error);
        }
        //update drop down list
        update_badge_list();
    }
    //badge in list already, ignore
    else {
        let message = "UID already in list!";
        console.log(message);
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



//drop down list functions: 
//the drop down list takes all its info from local storage to keep them in sync. 

function fill_badge_list(badges,select_list){
    
    //fill select list with new badges
    for(let i = 0;i<badges.length; i++){
        //new option for list (empty)
        let new_option = document.createElement("option");
        //fill option with data
        new_option.textContent = badges[i];
        new_option.value = badges[i];
        //add option to select list in HTML
        select_list.appendChild(new_option);
    }
}

//helper function to clear badge list
function clear_badge_list(badge_list){
    len = badge_list.options.length-1;
    //loop through drop down list and clear it
    for(let i = len; i>=0;i--){
        badge_list.remove(i);
    }
}

//driver function to fill badge list
function update_badge_list(){
    //read badges from memory
    let badges = retrieveAllCodes();
    //dropdown menu from HTML
    let badge_list = document.getElementById("badges_list");
    //clear data
    clear_badge_list(badge_list);
    //refill with updated data
    fill_badge_list(badges, badge_list);
    console.log(badges);//test
}


//function to fill text box with selection from drop down list
function selection_to_text_box(){
    //HTML text box and drop down list
    let select_box = document.getElementById("badges_list");
    let text_box = document.getElementById("text_box");
    //take drop down list selection value and send to text box
    let selection = select_box.value;
    text_box.value = selection;
}
