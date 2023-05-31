#include <ArduinoBLE.h>

// char* receive_badge_from_websiteID = "0000180f-0000-1000-8000-000000000001";
// char* send_badge_to_websiteID = "0000180f-0000-1000-8000-000000000002";
// char* scan_badge_commandID = "0000180f-0000-1000-8000-000000000003";
char* receive_badge_from_websiteID = "0001";
char* send_badge_to_websiteID = "0002";
char* scan_badge_commandID = "0003";
char* turn_off_deviceID = "0004";

char* UID_Card = "6B 8C 88 15";
char* UID_Cards[] = {"6B 8C 88 15", "3A 4D 9C 03", "00 00 00 00"};
int counter = 0;

//5f9b34fb alternative
BLEService RFID_service("180F");
BLECharacteristic cloner_receive(receive_badge_from_websiteID, BLERead | BLEWrite | BLENotify, "***********"); 
BLECharacteristic cloner_transmit(send_badge_to_websiteID, BLERead | BLENotify, "***********");
BLECharacteristic cloner_command_scan(scan_badge_commandID, BLERead | BLEWrite,"***********");
BLECharacteristic turn_off_device(turn_off_deviceID, BLERead | BLEWrite,"***********");



void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN,OUTPUT);//LED PRINT
  

  BLE.begin();
  RFID_service.addCharacteristic(cloner_receive);
  RFID_service.addCharacteristic(cloner_transmit);
  RFID_service.addCharacteristic(cloner_command_scan);
  RFID_service.addCharacteristic(turn_off_device);
  
 
  BLE.addService(RFID_service);
  BLE.setLocalName("dans RFID");
  BLE.advertise();
  BLE.setAdvertisedService(RFID_service);
 
  cloner_transmit.writeValue(UID_Card);
      
  
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
         blink_led();
                  
        }
      
        if(cloner_command_scan.written()){
          blink_led();
          cloner_transmit.writeValue(UID_Card);//if command sent, write UID to website
        }

        if(turn_off_device.written()){
          Serial.println("TURNING OFF!");
        }
        
        //test to write changing values
        if(counter >= 3){
          counter = 0;
          }
        cloner_transmit.writeValue(UID_Cards[counter]);
        counter++;
        //delay(1000);
        
    }

  }
Serial.println("done");
delay(100);
}

//LED blink
void blink_led(){
  for(int i = 0; i<10;i++){
    digitalWrite(LED_BUILTIN,HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN,LOW);
    delay(100);
  }
  
  return;
}
