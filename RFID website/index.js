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
const writeBadgeToClonerID = 0x0001;

/**
 * The ID for receiving badge data from the cloner.
 * @type {number}
 */
const receiveBadgeFromClonerID = 0x0002;

/**
 * The ID for the command to scan a badge on the cloner.
 * @type {number}
 */
const scanBadgeCommand = 0x0003;

/**
 * The ID for the command to turn off the cloner device.
 * @type {number}
 */
const turnOffDeviceCommand = 0x0004;

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
let clonerTransmitCharacteristic;

/**
 * The characteristic for receiving data from the web application to the cloner.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerReceiveCharacteristic;

/**
 * The characteristic for sending the command to scan a badge on the cloner.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerScanCommandCharacteristic;

/**
 * The characteristic for sending the command to turn off the cloner device.
 * @type {BluetoothRemoteGATTCharacteristic}
 */
let clonerTurnOffCharacteristic;

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
}

/**
 * Sets up RFID cloner notification.
 * @returns {Promise<void>} A promise that resolves when the RFID cloner notification is set up.
 */
async function setupRFIDnotifications() {
  if (clonerTransmitCharacteristic.properties.notify) {
    // get updated characteristic if notification received
    try {
      await clonerTransmitCharacteristic.startNotifications();
    } catch (error) {
      console.log('notifications not started!');
    }

    // add event listener to characteristic, then if notification change val
    clonerTransmitCharacteristic.addEventListener(
      'characteristicvaluechanged',

      // aero function event listener activates when notification arrives
      async (eventHandler) => {
        try {
          let val = eventHandler.target.value;
          val = decoder.decode(val);
          document.getElementById('RFID_Badge_number').innerHTML = val;
          // store UID to JSON data
          storeRFIDCode(val);
        } catch (DOMException) {
          console.log('notification failure.');
        }
      },
    );
  }
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
  clonerTransmitCharacteristic = await service.getCharacteristic(receiveBadgeFromClonerID);
  clonerReceiveCharacteristic = await service.getCharacteristic(writeBadgeToClonerID);
  clonerScanCommandCharacteristic = await service.getCharacteristic(scanBadgeCommand);
  clonerTurnOffCharacteristic = await service.getCharacteristic(turnOffDeviceCommand);
  // publish device name to website
  document.getElementById('bluetooth_device_name').innerHTML = cloner.name;
  // start notification services for cloner
  setupRFIDnotifications();
  console.log('DONE!');
}

/**
 * Sends badge number to the cloner via button push.
 * @returns {Promise<void>} A promise that resolves when the data is sent to the cloncer.
 */
async function sendDataToCloner() {
  try {
    // get text box content
    const val = document.getElementById('text_box').value;
    // save custom UID to list of ID's
    storeRFIDCode(val);

    // convert to byte array
    const byteBuff = await encoder.encode(val);
    await clonerReceiveCharacteristic.writeValue(byteBuff);
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * Sends a command to the cloner to scan a badge.
 * @returns {Promise<void>} A promise that resolves when the command is sent to the cloner.
 */
async function clonerCommandScan() {
  try {
    // Cloner waits for data to arrive on this characteristic.
    // Doesnt matter what the data is, just that it arrives.
    const data = encoder.encode('***********');
    await clonerScanCommandCharacteristic.writeValue(data);
  } catch (error) {
    console.log('cloner command scan characteristic unreachable.');
  }
}

/**
 * Sends a command to turn off the cloner device.
 * @returns {Promise<void>} A promise that resolves when the command is sent to turn off the cloner.
 */
async function clonerTurnOff() {
  const data = await encoder.encode('***********');
  await clonerTurnOffCharacteristic.writeValue(data);
}
