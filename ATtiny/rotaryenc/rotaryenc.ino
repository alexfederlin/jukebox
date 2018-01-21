#include "avr/interrupt.h"; 
#include "TinyWire.h"

volatile int value = 122;
volatile int lastEncoded = 0;

byte own_address = 11;

void setup()
{
 
  // set pins 3 and 4 to input
  // and enable pullup resisters
  pinMode(3, INPUT);
  pinMode(4, INPUT);
  digitalWrite(3, HIGH);
  digitalWrite(4, HIGH);
 
  GIMSK = 0b00100000;       // Enable pin change interrupts
  PCMSK = 0b00011000;       // Enable pin change interrupt for PB3 and PB4
  sei();                    // Turn on interrupts

  // config TinyWire library for I2C slave functionality
  TinyWire.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWire.onRequest( onI2CRequest );
}
 
void loop()
{

}
 
// This is the ISR that is called on each interrupt
// Taken from http://bildr.org/2012/08/rotary-encoder-arduino/
ISR(PCINT0_vect)
{
  int MSB = digitalRead(3); //MSB = most significant bit
  int LSB = digitalRead(4); //LSB = least significant bit
 
  int encoded = (MSB << 1) |LSB; //converting the 2 pin value to single number
  int sum  = (lastEncoded << 2) | encoded; //adding it to the previous encoded value
 
  if(sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011)
    value++;
  if(sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000)
    value--;
 
  lastEncoded = encoded; //store this value for next time
 
  if (value <= 0)
    value = 0;
  if (value >= 255)
    value = 255;
}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
void onI2CRequest() {
  TinyWire.send(value);
}
