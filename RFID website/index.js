/**
 * @fileoverview This file contains JavaScript code for
 * interacting with a cloner device via Bluetooth.
 *
 * It includes functions for connecting to the cloner, sending
 * and receiving data, setting up notifications,
 * and controlling the cloner device. It also provides utility
 * functions for storing and retrieving RFID codes
 * in local storage and updating the user interface.
 * @author DanGeorge & NathanStrandberg
 */
/**
 * The cloner device object obtained from the Bluetooth connection.
 * @type {BluetoothDevice}
 */
let cloner;

/**
 * The GATT server object representing the connection to the cloner peripheral.
 * @type {BluetoothRemoteGATTServer}
 */
let server;

/**
 * The main service object for the cloner device.
 * @type {BluetoothRemoteGATTService}
 */
let service;

/**
 * The ID for writing badge data to the cloner.
 * @type {number}
 */
const writeBadgeToClonerIDFirstHalf = 0x0005;

/**
 * The ID for writing badge data to the cloner.
 * @type {number}
 */
const writeBadgeToClonerIDSecondHalf = 0x0006;

/**
 * The ID for receiving badge data from the cloner.
 * @type {number}
 */

const receiveBadgeFromClonerIDFirstHalf = 0x0003;

/**
 * The ID for receiving badge data from the cloner.
 * @type {number}
 */
const receiveBadgeFromClonerIDSecondHalf = 0x0004;

/**
 * The ID for the command to scan a badge on the cloner.
 * @type {number}
 */
const scanBadgeCommand = 0x0007;

/**
 * The decoder object used to convert byte data into strings.
 * @type {TextDecoder}
 */
const decoder = new TextDecoder();

/**
 * The encoder object used to convert strings into byte data.
 * @type {TextEncoder}
 */
const encoder = new TextEncoder();

/**
 * The characteristic for transmitting data from the cloner to the web application.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerTransmitCharacteristicFirstHalf;

/**
 * The characteristic for transmitting data from the cloner to the web application.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerTransmitCharacteristicSecondHalf;

/**
 * The characteristic for receiving data from the web application to the cloner.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerReceiveCharacteristicFirstHalf;

/**
 * The characteristic for receiving data from the web application to the cloner.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerReceiveCharacteristicSecondHalf;

/**
 * The characteristic for sending the command to scan a badge on the cloner.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerScanCommandCharacteristic;

// FUNCTIONS

/**
 * Retrieves all stored RFID codes from local storage.
 * Attempts to handles errors.
 * @returns {Array<string>} An array of stored RFID codes
 */
function retrieveAllCodes() {
  let existingCodes;

  try {
    if (typeof localStorage !== 'undefined') {
      existingCodes = localStorage.getItem('rfidCodes');
      existingCodes = existingCodes ? JSON.parse(existingCodes) : [];
    } else {
      existingCodes = [];
    }
  } catch (error) {
    existingCodes = [];
    console.error('Failed to retrieve RFID codes: ', error);
  }

  return existingCodes;
}

/**
 * Fills the badge list in the dropdown
 * @param {Array<string>} badges An array of badge numbers.
 * @param {HTMLSelectElement} selectList The HTML select element representing the dropdown.
 * @returns {void}
 */
function fillBadgeList(badges, selectList) {
  // fill select list with new badges
  for (let i = 0; i < badges.length; i += 1) {
    // new option for list (empty)
    const newOption = document.createElement('option');
    // fill option with data
    newOption.textContent = badges[i];
    newOption.value = badges[i];
    // add option to select list in HTML
    selectList.appendChild(newOption);
  }
}

/**
 * Clears the badge list in the dropdown menu.
 * @param {HTMLSelectElement} badgeList The HTML select element representign the dropdown menu.
 * @returns {void}
 */
function clearBadgeList(badgeList) {
  const len = badgeList.options.length - 1;
  // loop through drop down list and clear it
  for (let i = len; i >= 0; i -= 1) {
    badgeList.remove(i);
  }
}

/**
 * Updates the badge list in the dropdown menu.
 * @returns {void}
 */
function updateBadgeList() {
  // read badges from memory
  const badges = retrieveAllCodes();
  // dropdown menu from HTML
  const badgeList = document.getElementById('badges_list');
  // clear data
  clearBadgeList(badgeList);
  // refill with updated data
  fillBadgeList(badges, badgeList);
}

/**
 * Function to store an RFID code in local storage.
 * Attempts to handle errors.
 * @param {string} code - The RFID code to store.
 * @returns {void}
 */
function storeRFIDCode(code) {
  // variable to store existing codes
  let existingCodes;
  // retreive badge numbers from storage and put into array
  try {
    existingCodes = localStorage.getItem('rfidCodes');
    existingCodes = existingCodes ? JSON.parse(existingCodes) : [];
  } catch (error) {
    existingCodes = [];
  }

  // if new code not in list, add and save
  if (!existingCodes.includes(code)) {
    // add new code to the array of codes
    existingCodes.push(code);

    // save codes
    try {
      localStorage.setItem('rfidCodes', JSON.stringify(existingCodes));
    } catch (error) {
      console.error('Failed to save RFID code: ', error);
    }
    // update drop down list
    updateBadgeList();
  }
}

/**
 * Clears JSON data from the web browser.
 * @returns {void}
 */
function clearSavedData() {
  localStorage.removeItem('rfidCodes');
  // clear drop down list
  updateBadgeList();
}

/**
 * Fills the text box with the selection from the dropdown list.
 * @returns {void}
 */
function selectionToTextBox() {
  // HTML text box and drop down list
  const selectBox = document.getElementById('badges_list');
  const textBox = document.getElementById('text_box');
  // take drop down list selection value and send to text box
  const selection = selectBox.value;
  textBox.value = selection;
  console.log(selection);
}

/**
 * Connects to the cloner device via Bluetooth.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
async function connectToCloner() {
  // device find
  cloner = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['battery_service'],
  });

  // connect to cloner peripheral
  console.log('Connecting to Cloner Peripheral...');
  server = await cloner.gatt.connect();
  // get cloner service
  console.log('Getting main service...');
  // get GATT service
  service = await server.getPrimaryService('battery_service');

  // get characteristics from cloner. these characteristics will link to
  // buttons in website. they will each serve as different command for device
  console.log('Getting characteristics');
  clonerTransmitCharacteristicFirstHalf = await service.getCharacteristic(receiveBadgeFromClonerIDFirstHalf); 
  clonerTransmitCharacteristicSecondHalf = await service.getCharacteristic(receiveBadgeFromClonerIDSecondHalf);//Changed Here!
  clonerReceiveCharacteristicFirstHalf = await service.getCharacteristic(writeBadgeToClonerIDFirstHalf);
  clonerReceiveCharacteristicSecondHalf = await service.getCharacteristic(writeBadgeToClonerIDSecondHalf);
  clonerScanCommandCharacteristic = await service.getCharacteristic(scanBadgeCommand);
  // publish device name to website
  document.getElementById('bluetooth_device_name').innerHTML = cloner.name;
  // start notification services for cloner
  console.log('DONE!');
}

/**
 * Sends badge number to the cloner via button push.
 * @returns {Promise<void>} A promise that resolves when the data is sent to the cloncer. ISSUE translates address into wrong numbers. ascii 53 = 5 for instance
 */
async function sendDataToCloner() {
  try {
    // get text box content
    const val = document.getElementById('text_box').value;
    //convert string into 
    let asciiArray = val.replaceAll(',','').replaceAll(' ','');
    console.log(asciiArray);

    let dataLen = asciiArray.len;
    //convert array of chars into Uint8_t
    let asciiNumArray = encoder.encode(asciiArray);
    
    // save custom UID to list of ID's
    storeRFIDCode(val);

    // create array buffer 10 bytes long, each byte max 8 bits size
    let sendBuff = new ArrayBuffer(dataLen ,8);
    // dataview to access and fill array buffer 
    let sendBuffDataView = new DataView(sendBuff);
    // uint 8 array to pull out send buffer integers for viewing
    let sendBuffIntView = new Uint8Array(sendBuff);

    for(let i = 0;i<dataLen; i++){
      sendBuffDataView.setInt8(i,asciiNumArray[i]);
    }
    console.log(asciiNumArray);
    
    //attempt to send data to cloner in two pieces 512 per characteristic
    await clonerReceiveCharacteristicFirstHalf.writeValue(sendBuffDataView);
    await clonerReceiveCharacteristicSecondHalf.writeValue(sendBuffDataView);
       
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * Reads Cloner data via two characteristics on button push.
 * @returns {Promise<void>} Two promises that resolve when characteristics are read.
 */
async function readClonerData(){
  try {
    //Read in first half characteristic
    //ISSUE: whenever line 345 and 346 exicute the raw byte data is saved into the local storage, resulting in jibberish:FIXED line 240. need to update notification function there
    let data1 = await clonerTransmitCharacteristicFirstHalf.readValue();//read first half of data
    let data2 = await clonerTransmitCharacteristicSecondHalf.readValue();//read first half of data
    //create view to extract data from Dataview
    let view1 = new Uint8Array(data1.buffer);
    let view2 = new Uint8Array(data2.buffer);
    //build basic arrays from Uint8 array. this is becouse we cant concat them.
    let array1 = Array.from(view1);
    let array2 = Array.from(view2);
    let array3 = array1.concat(array2);
       
    //convert integer array to string for viewing in website
    val = array3.toString();
    storeRFIDCode(val);
    // update website ID 
    document.getElementById('RFID_Badge_number').innerHTML = val;
  } catch (error) {
    console.log('cloner command scan characteristic unreachable. ' + error);
  }
}
