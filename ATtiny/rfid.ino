#include "TinyWire.h"
#include "rdm630.h"
#####################################################
# This code takes care of reading RFID (RD6300)
# on an ATTiny45
# It needs to be polled from the master and will 
# return a bitmap of the last read RFID (hopefully)
#####################################################


// read these as PB1, PB3, PB4


byte own_address = 20;

rdm630 rfid(2, 0);  //TX-pin of RDM630 connected to Arduino pin 2
unsigned long time;
unsigned long lastTime;
unsigned long elapsedTime;
unsigned long blocktimer;
byte lastdata[6];
unsigned long lastRFID = 0;
bool block;

void setup() {

// initialize RFID
  rfid.begin();
  time = millis();
  lastTime = millis();
  blocktimer = 0L;
    
  // config TinyWire library for I2C slave functionality (SDA: PB0 , SCL: PB2)
  TinyWire.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWire.onRequest( onI2CRequest );
}

void loop() {
// RFID stuff
    byte data[6];
    byte length;

    time = millis();

    if(rfid.available()){
        //digitalWrite(ledPin, HIGH);
        if ((time - lastTime) < 1000) { // used to filter out sporadic spurious IDs
          
            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || (time-blocktimer > 5000)) { 
              //shift the bytes to their respective positions
              //explanation why casting is needed: http://www.mikrocontroller.net/topic/95708
              unsigned long result = ((unsigned long int)data[1]<<24) + ((unsigned long int)data[2]<<16) + ((unsigned long int)data[3]<<8) + data[4];              
          //    Serial.print("RFID: ");
          //    Serial.println(result);
              //lcdDisplay(String(result));
              lastRFID=result;
              rfid.getData(lastdata,length);
              blocktimer = millis();
          //    lcdRaise();
            }
        }
        lastTime = millis();
//        delay(5);
//        digitalWrite(ledPin, LOW); 
    }
}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
void onI2CRequest() {
  TinyWire.send(lastRFID);
}