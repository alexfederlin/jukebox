#include "TinyWire.h"

#####################################################
# This code takes care of reading three buttons
# on an ATTiny45
# It needs to be polled from the master and will 
# return a bitmap of the currently pressed buttons
#####################################################


// read these as PB1, PB3, PB4
#define button_pl 1
#define button_pr 3
#define button_ne 4

byte own_address = 10;


#define PR 5
#define PL 3
#define NE 1

// bit map: pr pl ne
// nothing pressed: 000000
// only pr pressed: 100000
// only pl pressed: 001000
// only ne pressed: 000010
// all three pressed: 101010
// the reason for shifting everything up and having a bit free between is that the I2C bus sometimes right shifts the read byte for some reason. So if I would rely on the first bit to signal next pressed, I would end up with several next presses over time, as the read value would sometimes toggel to 0
// with this bitmap, shifting the reading right one bit does not generate another button push (or release)
// excellent explanation of the bitshifting here: https://embeddedthoughts.com/2016/05/25/getting-started-with-the-attiny85/#more-1173
byte buttonstate = 0x0;

void setup() {
  // config button pins as INPUT for a connected button (normally open; connects to GND)
  pinMode( button_pl, INPUT_PULLUP);
  pinMode( button_pr, INPUT_PULLUP);
  pinMode( button_ne, INPUT_PULLUP);
  
  // config TinyWire library for I2C slave functionality
  TinyWire.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWire.onRequest( onI2CRequest );
}

void loop() {
  if(digitalRead(button_pl) == 0) {
    buttonstate |= (1 << PL);
  }
  else {
    buttonstate &= ~(1 << PL);
  }

  if(digitalRead(button_pr) == 0) {
    buttonstate |= (1 << PR);
  }
  else {
    buttonstate &= ~(1 << PR);
  }

  if(digitalRead(button_ne) == 0) {
    buttonstate |= (1 << NE);
  }
  else {
    buttonstate &= ~(1 << NE);
  }

}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
void onI2CRequest() {
  TinyWire.send(buttonstate);
}