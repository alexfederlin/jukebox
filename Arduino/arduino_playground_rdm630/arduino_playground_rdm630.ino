// this code based on the example code on http://playground.arduino.cc/Main/RDM630RFIDReaderLibrary

#include "rdm630.h"

const int ledPin =  13;

rdm630 rfid(2, 0);  //TX-pin of RDM630 connected to Arduino pin 2
unsigned long time;
unsigned long lastTime;
unsigned long elapsedTime;
unsigned long blocktimer;
byte lastdata[6];
bool block;

void setup()
{
    Serial.begin(9600);  // start serial to PC
    rfid.begin();
    Serial.println("starting");
    
    pinMode(ledPin, OUTPUT); 
    
    elapsedTime = 0L;
    time = millis();
    lastTime = millis();
    block = false;
    blocktimer = 0L;
    
}

void loop()
{
    byte data[6];
    byte length;

    time = millis();

    if (time-blocktimer > 5000)
      block = false;
    
    if(rfid.available()){
        digitalWrite(ledPin, HIGH);
        elapsedTime = time - lastTime;
        lastTime = millis();
        if (elapsedTime < 1000) { // used to filter out sporadic spurious IDs
          
            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || block == false) { 
              //Serial.println("Data valid");
              for(int i=0;i<length;i++){
                  Serial.print(data[i],BIN);
                  Serial.print(" ");
              }
              //shift the bytes to their respective positions
              //explanation why casting is needed: http://www.mikrocontroller.net/topic/95708
              unsigned long result = ((unsigned long int)data[1]<<24) + ((unsigned long int)data[2]<<16) + ((unsigned long int)data[3]<<8) + data[4];              
              Serial.println();
              Serial.print("decimal: ");
              Serial.println(result);
              rfid.getData(lastdata,length);
              block = true;
              blocktimer = millis();
            }
        }
        delay(50);
        digitalWrite(ledPin, LOW); 
    }
}

