
/*
 *      based on 
 *      - Rotary Encoder: http://www.buxtronix.net/2011/10/rotary-encoders-done-properly.html
 *      - RFID Handling:  http://playground.arduino.cc/Main/RDM630RFIDReaderLibrary
 *      
 */


#include    <MsTimer2.h>
#include <SoftwareSerial.h>
#include "rdm630.h"
#include <LiquidCrystal.h>
#include <Wire.h>


// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(A0, A1, A2, A3, A4, A5);
int lcdBacklightPin = 9;
#define LCDWIDTH 16
#define LCDHEIGHT 2

String pinnedString = "online";
String scrollingString = "The Jukebox is";
int pinnedRow = LCDHEIGHT / 2;
int scrollingRow =  LCDHEIGHT / 2 - 1;
int scrollingSpeed = 400;


byte playicon[8] =
{
  0b10000,
  0b11000,
  0b11100,
  0b11110,
  0b11110,
  0b11100,
  0b11000,
  0b10000
};

byte pauseicon[8]  = {
  0b00000,
  0b11011,
  0b11011,
  0b11011,
  0b11011,
  0b11011,
  0b11011,
  0b00000
};

byte stopicon[8] = {
  0b00000,
  0b00000,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b11111,
  0b00000
};

int lcdCurBrightness = 0;
unsigned long lcdLastRaise;

// Rotary Encoder Stuff
///////////////////////////////////////////////////////////////////////////////

#define DIR_NONE 0x00           // No complete step yet.
#define DIR_CW   0x10           // Clockwise step.
#define DIR_CCW  0x20           // Anti-clockwise step.

unsigned int A = 6;             // pins connected to the encoder (CLK)
unsigned int B = 7;             //              "                (DT)
unsigned int ISRflag = 8;       //              "                (SW)

unsigned int state;
         int count = 40;         // count each indent
         int old_count = 0;     // check for count changed
const String VOLUME = "CMD: setvol ";
String vol = VOLUME;
/*
 * The below state table has, for each state (row), the new state
 * to set based on the next encoder output. From left to right in,
 * the table, the encoder outputs are 00, 01, 10, 11, and the value
 * in that position is the new state to set.
 */

// State definitions state table (emits a code at 00 only)
// states are: (NAB) N = 0: clockwise;  N = 1: counterclockwiswe
#define R_START     0x3
#define R_CW_BEGIN  0x1
#define R_CW_NEXT   0x0
#define R_CW_FINAL  0x2
#define R_CCW_BEGIN 0x6
#define R_CCW_NEXT  0x4
#define R_CCW_FINAL 0x5

const unsigned char ttable[8][4] = {
    {R_CW_NEXT,  R_CW_BEGIN,  R_CW_FINAL,  R_START},                // R_CW_NEXT
    {R_CW_NEXT,  R_CW_BEGIN,  R_CW_BEGIN,  R_START},                // R_CW_BEGIN
    {R_CW_NEXT,  R_CW_FINAL,  R_CW_FINAL,  R_START | DIR_CW},       // R_CW_FINAL
    {R_START,    R_CW_BEGIN,  R_CCW_BEGIN, R_START},                // R_START
    {R_CCW_NEXT, R_CCW_FINAL, R_CCW_BEGIN, R_START},                // R_CCW_NEXT
    {R_CCW_NEXT, R_CCW_FINAL, R_CCW_FINAL, R_START | DIR_CCW},      // R_CCW_FINAL
    {R_CCW_NEXT, R_CCW_BEGIN, R_CCW_BEGIN, R_START},                // R_CCW_BEGIN
    {R_START,    R_START,     R_START,     R_START}                 // ILLEGAL
};





//Button stuff
///////////////////////////////////////////////////////////////////////////////

const int buttonPin_back = 3;     // the number of the pushbutton pin
const int buttonPin_play = 4;     // the number of the pushbutton pin
const int buttonPin_forward = 5;     // the number of the pushbutton pin
const int ledPin =  13;      // the number of the LED pin

int buttonState_back = 0;         // variable for reading the pushbutton status
int buttonState_play = 0;         // variable for reading the pushbutton status
int buttonState_forward = 0;         // variable for reading the pushbutton status
int sentstate = 0;


//RFID Stuff
///////////////////////////////////////////////////////////////////////////////

rdm630 rfid(2, 0);  //TX-pin of RDM630 connected to Arduino pin 2
unsigned long time;
unsigned long lastTime;
unsigned long elapsedTime;
unsigned long blocktimer;
byte lastdata[6];
bool block;


// Serial stuff
/////////////////////////////////////////////////////////////////////////////// 
String incomingString = "";


// Helper Methods
///////////////////////////////////////////////////////////////////////////////

// Timer method for Rotary Encoder polling
void T2_isr( ) {

    // Grab state of input pins.
    unsigned char pinstate = (digitalRead( A ) << 1) | digitalRead( B );

    // Determine new state from the pins and state table.
    state = ttable[state & 0x07][pinstate];

    if( state & DIR_CW )    count=count+10;        // count up for clockwise
    if( state & DIR_CCW )   count=count-10;        // count down for counterclo$

}


void lcdDim( ) {
  int lowest = 20;
  for (int fadeValue = lcdCurBrightness ; fadeValue >= lowest; fadeValue -= 5) {
    // sets the value (range from 0 to 255):
    analogWrite(lcdBacklightPin, fadeValue);
    // wait for 30 milliseconds to see the dimming effect
    delay(30);
  }
  lcdCurBrightness = lowest;
}

void lcdRaise( ) {
  int highest = 255;
  for (int fadeValue = lcdCurBrightness ; fadeValue <= highest; fadeValue += 5) {
    // sets the value (range from 0 to 255):
    analogWrite(lcdBacklightPin, fadeValue);
    delay(5);
  }
  lcdCurBrightness = highest;
  lcdLastRaise = millis();
}

void lcdDisplay(String str) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(str);
}


// read from Serialport until a CR is found
// see https://hackingmajenkoblog.wordpress.com/2016/02/01/reading-serial-on-the-arduino/
int readline(int readch, char *buffer, int len)
{
  static int pos = 0;
  int rpos;

  if (readch > 0) {
    switch (readch) {
      case '\n': // Ignore new-lines
        break;
      case '\r': // Return on CR
        rpos = pos;
        pos = 0;  // Reset position index ready for next time
        return rpos;
      default:
        if (pos < len-1) {
          buffer[pos++] = readch;
          buffer[pos] = 0;
        }
    }
  }
  // No end of line has been found, so return -1.
  return -1;
}


/* This procedure pins a given text in the center of a desired row while scrolling from right to left another given text on another desired row.
    Parameters:
    const String &pinnedText: pinned String
    int pinnedRow: desired row for pinned String
    const String &scrollingText: scrolling String
    int scrollingRow: desired row for scrolling String
    int v = scrolling speed expressed in milliseconds
*/
void pinAndScrollText(const String &pinnedText, int pinnedRow, const String &scrollingText, int scrollingRow, int v) {
  if (pinnedRow == scrollingRow || pinnedRow < 0 || scrollingRow < 0 || pinnedRow >= LCDHEIGHT || scrollingRow >= LCDHEIGHT || pinnedText.length() > LCDWIDTH || v < 0) {
    lcd.clear();
    lcd.print("Error");
    while (1);
  }
  int l = pinnedText.length();
  lcd.setCursor(l % 2 == 0 ? LCDWIDTH / 2 - (l / 2) : LCDWIDTH / 2 - (l / 2) - 1, pinnedRow);
  lcd.print(pinnedText);
  int x = LCDWIDTH;
  int n = scrollingText.length() + x;
  int i = 0;
  int j = 0;
  while (n > 0) {
    if (x > 0) {
      x--;
    }
    lcd.setCursor(x, scrollingRow);
    if (n > LCDWIDTH) {
      j++;
      i = (j > LCDWIDTH) ? i + 1 : 0;
      lcd.print(scrollingText.substring(i, j));
    } else {
      i = i > 0 ? i + 1 : 0;
      if (n == scrollingText.length()) {
        i++;
      }
      lcd.print(scrollingText.substring(i, j));
      lcd.setCursor(n - 1, scrollingRow);
      lcd.print(' ');
    }
    n--;
    if (n > 0) {
      delay(v);
    }
  }
}


// Setup
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

void setup( ) {

//initialize LCD
    lcdRaise();
    lcd.createChar(0, playicon);
    lcd.createChar(1, pauseicon);
    lcd.createChar(2, stopicon);
    lcd.begin(16, LCDHEIGHT);

  //pinAndScrollText(pinnedString, pinnedRow, scrollingString, scrollingRow, scrollingSpeed);

//  delay(2000);
  lcd.clear();
//  lcd.print("Back");

    
// initialize the Rotary Encoder
    // pins as an input
    pinMode( A, INPUT );
    pinMode( B, INPUT );
    // start interrupt polling
    MsTimer2::set( 1, T2_isr );
    MsTimer2::start( );
    state = (digitalRead( A ) << 1) | digitalRead( B );     // Initialise state.
    old_count = 0;

//set up visual feedback for button push and RFID action
    pinMode(ledPin, OUTPUT);      

// initialize the pushbutton pin as an input:
    pinMode(buttonPin_back, INPUT);
    pinMode(buttonPin_play, INPUT);     
    pinMode(buttonPin_forward, INPUT);  


// initialize RFID
    rfid.begin();
    time = millis();
    lastTime = millis();
    blocktimer = 0L;

// initialize Serial connection

    Serial.begin( 9600 );
    Serial.println( "Jukebox Input Module Online" );
    Serial.setTimeout(200);

// Print a message to the LCD.
    lcdDisplay("Jukebox Online");
//    lcd.setCursor(15,0);
//    lcd.write((uint8_t)2);
}


// Loop
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

void loop( ) {

//read from serial

  static char buffer[80];
  if (readline(Serial.read(), buffer, 80) > 0) {
    Serial.print("Data received by Arduino: >");
    Serial.print(buffer);
    Serial.println("<");
    lcdDisplay(buffer);
  }

// Rotary Encoder 
    if( old_count != count ) {
        if ( count > 100 ) {
          count=100;
          return;
        }
        if ( count < 0) {
          count=0;
          return;
        }
        vol = VOLUME + count; 
        Serial.println(vol);
        //lcdDisplay(vol);
        old_count = count;
        lcdRaise();
        lcdDisplay ("Lautstaerke: " + String(count));
    }

//Pushbuttons
  // read the state of the pushbutton value:
  buttonState_back = digitalRead(buttonPin_back);
  buttonState_play = digitalRead(buttonPin_play);
  buttonState_forward = digitalRead(buttonPin_forward);
  
  
  // check if the pushbutton is pressed.
  // if it is, the buttonState is HIGH:
  if ((buttonState_back == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);
    Serial.println("CMD: previous");
    lcdDisplay("previous");
    sentstate = 1;
    lcdRaise();
  } 
  else if ((buttonState_play == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("playpause");
    //lcdDisplay("playpause");
    lcd.setCursor(15,0);
    lcd.write((uint8_t)0);
    sentstate = 1;
    lcdRaise();
  }
  else if ((buttonState_forward == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("CMD: next");
    lcdDisplay("next");
    sentstate = 1;
    lcdRaise();
  }
  else if ((buttonState_back == LOW) && (buttonState_play == LOW) && (buttonState_forward == LOW)){
    // turn LED off:
    digitalWrite(ledPin, LOW); 
    sentstate = 0;
  }

// RFID stuff
    byte data[6];
    byte length;

    time = millis();

    if(rfid.available()){
        digitalWrite(ledPin, HIGH);
        if ((time - lastTime) < 1000) { // used to filter out sporadic spurious IDs
          
            rfid.getData(data,length);
            // avoid continous repetition of one and the same ID while held to reader during a block time of 5 seconds
            // output only if a different ID is read or if the block is removed
            if (memcmp(lastdata,data,length) != 0 || (time-blocktimer > 5000)) { 
              //shift the bytes to their respective positions
              //explanation why casting is needed: http://www.mikrocontroller.net/topic/95708
              unsigned long result = ((unsigned long int)data[1]<<24) + ((unsigned long int)data[2]<<16) + ((unsigned long int)data[3]<<8) + data[4];              
              Serial.print("RFID: ");
              Serial.println(result);
              //lcdDisplay(String(result));
              rfid.getData(lastdata,length);
              blocktimer = millis();
              lcdRaise();
            }
        }
        lastTime = millis();
        delay(5);
        digitalWrite(ledPin, LOW); 
    }

//  lcd.setCursor(0, 1);
  // print the number of seconds since reset:
//  lcd.print(millis() / 1000);

  if (millis() - lcdLastRaise > 10000) lcdDim();

}



