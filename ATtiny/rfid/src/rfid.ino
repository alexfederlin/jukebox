#include "TinyWireS.h"
#include "rdm630.h"
//#####################################################
// This code takes care of reading RFID (RD6300)
// on an ATTiny45
// It needs to be polled from the master and will 
// return a bitmap of the last read RFID (hopefully)
//#####################################################


byte own_address = 20;

int ledPin = 1;

rdm630 rfid(3, 4);  //TX-pin of RDM630 connected to PB3
unsigned long time;
unsigned long lastTime;
unsigned long elapsedTime;
unsigned long blocktimer;
byte data[6];
byte lastdata[6];
unsigned long lastRFID = 0;
int i2cSendStep = 0;
bool i2cSendComplete = true;
byte i2cSendData[6];
bool block;

void setup() {

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
// initialize RFID
  rfid.begin();
  time = millis();
  lastTime = millis();
  blocktimer = 0L;
    
  // config TinyWire library for I2C slave functionality (SDA: PB0 , SCL: PB2)
  TinyWireS.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWireS.onRequest( onI2CRequest );
}

void loop() {
// RFID stuff
    
    byte length;

    time = millis();

    if(rfid.available()){
        
        if ((time - lastTime) < 1000) { // used to filter out sporadic spurious IDs

            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || (time-blocktimer > 5000)) { 
              digitalWrite(ledPin, HIGH);  
              //shift the bytes to their respective positions
              //explanation why casting is needed: http://www.mikrocontroller.net/topic/95708
              lastRFID = ((unsigned long int)data[1]<<24) + ((unsigned long int)data[2]<<16) + ((unsigned long int)data[3]<<8) + data[4];              
          //    Serial.print("RFID: ");
          //    Serial.println(result);
              //lcdDisplay(String(result));

              rfid.getData(lastdata,length);
              blocktimer = millis();
          //    lcdRaise();
            }
        }
        lastTime = millis();
//        delay(5);
        digitalWrite(ledPin, LOW); 
    }
    if (i2cSendComplete) {
      for (int i=0; i<6; i++) {
        i2cSendData[i] = data[i];
      }
      
    }
}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
// void onI2CRequest() {
//   TinyWireS.send(lastRFID);
// }

void onI2CRequest()
{

  //send 0 255 0 as delimiter between two RFID tags
  if ((i2cSendStep >= 0) && (i2cSendStep < 4)) {
    i2cSendStep++;
    i2cSendComplete = false;
    TinyWireS.send(i2cSendData[i2cSendStep]);  
  }
  else {
    if (i2cSendStep >0) {
      i2cSendStep = -2;
      i2cSendComplete = true;
      TinyWireS.send(0);  
    }
    else {
      if (i2cSendStep == -2) {
        TinyWireS.send(255);
        i2cSendStep++;
      }
      else {
        TinyWireS.send(0);
        i2cSendStep = 0;
      }
    }
  }
}