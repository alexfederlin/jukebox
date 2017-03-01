#include "rdm630.h"

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
    elapsedTime = 0L;
    time = millis();
    lastTime = millis();
    block = false;
    blocktimer = 0;
}

void loop()
{
    byte data[6];
    byte length;

    time = millis();

    if (time-blocktimer > 5000)
      block = false;
    
    if(rfid.available()){
        elapsedTime = time - lastTime;
        lastTime = millis();
        if (elapsedTime < 1000) { // used to filter out sporadic spurious IDs
          
            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || block == false) { 
              //Serial.println("Data valid");
              for(int i=0;i<length;i++){
                  Serial.print(data[i],HEX);
                  Serial.print(" ");
              }
              
              Serial.println();
              Serial.print("elapsed Time: ");
              Serial.println(elapsedTime);
              rfid.getData(lastdata,length);
              block = true;
              blocktimer = millis();
            }
        }
    }
}

