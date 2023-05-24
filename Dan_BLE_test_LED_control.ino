#include <ArduinoBLE.h>

char* receive_badge_from_websiteID = "0000180f-0000-1000-8000-000000000001";
char* send_badge_to_websiteID = "0000180f-0000-1000-8000-000000000002";
char* scan_badge_commandID = "0000180f-0000-1000-8000-000000000003";

char* UID_Card = "6B 8C 88 15";

BLEService RFID_service("0000180f-0000-1000-8000-00805f9b34fb");
BLECharacteristic cloner_receive(receive_badge_from_websiteID, BLERead | BLEWrite | BLENotify, "***********"); 
BLECharacteristic cloner_transmit(send_badge_to_websiteID, BLERead | BLENotify, "***********");
BLEByteCharacteristic cloner_command_scan(scan_badge_commandID, BLERead | BLEWrite);

int counter = 0;

void setup() {
  Serial.begin(9600);

  BLE.begin();
  RFID_service.addCharacteristic(cloner_receive);
  RFID_service.addCharacteristic(cloner_transmit);
  RFID_service.addCharacteristic(cloner_command_scan);
  
 
  BLE.addService(RFID_service);
  BLE.setLocalName("dans RFID");
  BLE.advertise();
  BLE.setAdvertisedService(RFID_service);
  
  
  //cloner_receive.writeValue(7);
  
    cloner_transmit.writeValue(UID_Card);
    
  
  
  //cloner_command_scan.writeValue(1);//1 for true
  
  
  
}

void loop() {
  
  BLEDevice phone = BLE.central();

  if(phone){
    Serial.println("connected");
    while(phone.connected()){
        if(cloner_receive.written()){
         byte buffer2[11];
         cloner_receive.readValue(buffer2,11);
         //variable from website
         String val = String((char *)buffer2);
         Serial.println(val);
         delay(100);
                  
        }
        if(cloner_receive.written() != 0){
          Serial.println(cloner_receive.written());
        }
    }

  }
Serial.println("done");
delay(100);
}
