#include <interrupt.h>
#include <TinyWireS.h>

volatile int value = 122;
volatile int sendvalue = 60;
volatile int lastEncoded = 0;

#define SW 1
#define CLK 3
#define DT 4


byte own_address = 11;

void setup()
{
 
  // set pins 3 and 4 to input
  // and enable pullup resistors
  pinMode(SW, INPUT); // SW
  pinMode(CLK, INPUT); // CLK
  pinMode(DT, INPUT); // DT
  digitalWrite(SW, HIGH);
  digitalWrite(CLK, HIGH);
  digitalWrite(DT, HIGH);
 
  GIMSK = 0b00100000;       // Enable pin change interrupts
  PCMSK = 0b00011000;       // Enable pin change interrupt for PB3 and PB4
  sei();                    // Turn on interrupts

  // config TinyWire library for I2C slave functionality
  TinyWireS.begin( own_address );
  // register a handler function in case of a request from a master
  TinyWireS.onRequest( onI2CRequest );
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
  if (value >= 127)
    value = 127;
}

// Request Event handler function
//  --> Keep in mind, that this is executed in an interrupt service routine. It shouldn't take long to execute
void onI2CRequest() {
  sendvalue = value;
 // highest bit in byte signifies switch pressed
  if (digitalRead(SW) == 0) {
    if (sendvalue < 128){
      sendvalue = value+128;
    }
  }
  // else{
  //   if (sendvalue >=128){
  //     sendvalue = sendvalue - 128;
  //   }
  // }
  TinyWireS.send(sendvalue);
}
