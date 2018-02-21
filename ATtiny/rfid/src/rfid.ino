#include "TinyWireS.h"
#include "rdm630.h"
//#####################################################
// This code takes care of reading RFID (RD6300)
// on an ATTiny45
// It needs to be polled from the master and will 
// return a bitmap of the last read RFID (hopefully)
//#####################################################

int ledPin = 1;

rdm630 rfid(3, 4);  //TX-pin of RDM630 connected to PB3

unsigned long time;
unsigned long lastTime;
unsigned long blocktimer;

byte data[6];
byte lastdata[6];

byte i2cAddress = 20;
int i2cSendStep = 0;
bool i2cSendComplete = true;
byte i2cSendData[6];



void setup() {

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

// initialize RFID
  rfid.begin();

  time = millis();
  lastTime = millis();
  blocktimer = 0L;

  // config TinyWire library for I2C slave functionality (SDA: PB0 , SCL: PB2)
  TinyWireS.begin( i2cAddress );
  // register a handler function in case of a request from a master
  TinyWireS.onRequest( onI2CRequest );
}

void loop() {
    
    byte length;

    time = millis();

    if(rfid.available()){
        
        if ((time - lastTime) < 1000) { // throw away first read ID. Used to filter out sporadic spurious IDs

            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || (time-blocktimer > 5000)) { 
              digitalWrite(ledPin, HIGH);  
              rfid.getData(lastdata,length);
              blocktimer = millis();
            }
        }
        lastTime = millis();
        digitalWrite(ledPin, LOW); 
    }
    // copy the latest read data to the send buffer only if we are not in the
    // process of currently sending out an RFID
    
    if (i2cSendComplete) {
      for (int i=0; i<6; i++) {
        i2cSendData[i] = data[i];
      }
    }
}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
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