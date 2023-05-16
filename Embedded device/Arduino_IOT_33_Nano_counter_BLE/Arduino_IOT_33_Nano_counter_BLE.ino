#include <ArduinoBLE.h>

BLEService counterService("0000180f-0000-1000-8000-00805f9b34fb");
BLEUnsignedCharCharacteristic counterCharacteristic("2A19", BLERead | BLENotify); 
int counter = 0;

void setup() {
  Serial.begin(9600);

  BLE.begin();
  counterService.addCharacteristic(counterCharacteristic);
  BLE.addService(counterService);
  BLE.setLocalName("dans counter");
  BLE.advertise();
  BLE.setAdvertisedService(counterService);
  counterCharacteristic.writeValue(counter);
  
}

void loop() {
  
  BLEDevice phone = BLE.central();

  if(phone){
    Serial.println("connected");
    while(phone.connected()){
        counterCharacteristic.writeValue(counter);
        counter++;
        if(counter > 10){
          counter = 0;
          }
          Serial.println(counter);
        delay(100);
    }

  }

}
