/*
  Button
 
 Turns on and off a light emitting diode(LED) connected to digital  
 pin 13, when pressing a pushbutton attached to pin 2. 
 
 
 The circuit:
 * LED attached from pin 13 to ground 
 * pushbutton attached to pin 2 from +5V
 * 10K resistor attached to pin 2 from ground
 
 * Note: on most Arduinos there is already an LED on the board
 attached to pin 13.
 
 
 created 2005
 by DojoDave <http://www.0j0.org>
 modified 30 Aug 2011
 by Tom Igoe
 
 This example code is in the public domain.
 
 http://www.arduino.cc/en/Tutorial/Button
 */

// constants won't change. They're used here to 
// set pin numbers:
const int buttonPin_back = 2;     // the number of the pushbutton pin
const int buttonPin_play = 3;     // the number of the pushbutton pin
const int buttonPin_forward = 4;     // the number of the pushbutton pin
const int ledPin =  13;      // the number of the LED pin

// variables will change:
int buttonState_back = 0;         // variable for reading the pushbutton status
int buttonState_play = 0;         // variable for reading the pushbutton status
int buttonState_forward = 0;         // variable for reading the pushbutton status
int sentstate = 0;

void setup() {
  
  Serial.begin(9600);
  
  // initialize the LED pin as an output:
  pinMode(ledPin, OUTPUT);      
  // initialize the pushbutton pin as an input:
  pinMode(buttonPin_back, INPUT);
  pinMode(buttonPin_play, INPUT);     
  pinMode(buttonPin_forward, INPUT);  
}

void loop(){
  // read the state of the pushbutton value:
  buttonState_back = digitalRead(buttonPin_back);
  buttonState_play = digitalRead(buttonPin_play);
  buttonState_forward = digitalRead(buttonPin_forward);
  
  
  // check if the pushbutton is pressed.
  // if it is, the buttonState is HIGH:
  if ((buttonState_back == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);
    Serial.println("back");
    sentstate = 1;
  } 
  else if ((buttonState_play == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("play");
    sentstate = 1;
  }
  else if ((buttonState_forward == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("forward");
    sentstate = 1;
  }
  else if ((buttonState_back == LOW) && (buttonState_play == LOW) && (buttonState_forward == LOW)){
    // turn LED off:
    digitalWrite(ledPin, LOW); 
    sentstate = 0;
  }
}
