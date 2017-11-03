#include "TinyWire.h"

#define led_pin 1
#define button_pin 3
#define error_led_pin 4

byte own_address = 10;
bool button_pressed = false;

void setup() {
  // config led_pin as Output for driving an LED
  pinMode(led_pin, OUTPUT);
  // config error_led_pin as Output for driving an LED
  pinMode(error_led_pin, OUTPUT);
  // config button_pin als INPUT for a connected button (normally open; connects to GND)
  pinMode( button_pin, INPUT_PULLUP);
  
  // config TinyWire library for I2C slave functionality
  TinyWire.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWire.onRequest( onI2CRequest );
}

void loop() {
  if(digitalRead(button_pin) == 0) {
    button_pressed = true;
    digitalWrite(error_led_pin, LOW);
  }
  else {
    button_pressed = false;
    digitalWrite(led_pin, LOW);
  }

}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
void onI2CRequest() {
  if (button_pressed == true) {
      TinyWire.send('a');  
      digitalWrite(led_pin, HIGH);
  }
  else {
    TinyWire.send('b');
    digitalWrite(error_led_pin, HIGH);
  }
}