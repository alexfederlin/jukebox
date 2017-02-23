
/*
 *      based on 
 *      - Rotary Encoder: http://www.buxtronix.net/2011/10/rotary-encoders-done-properly.html
 *      - RFID Handling:  https://gist.github.com/maniacbug/1273970
 *      
 */


#include    <MsTimer2.h>
#include <SoftwareSerial.h>



#define DIR_NONE 0x00           // No complete step yet.
#define DIR_CW   0x10           // Clockwise step.
#define DIR_CCW  0x20           // Anti-clockwise step.

unsigned int state;
//button pins
const int buttonPin_back = 3;     // the number of the pushbutton pin
const int buttonPin_play = 4;     // the number of the pushbutton pin
const int buttonPin_forward = 5;     // the number of the pushbutton pin
const int ledPin =  13;      // the number of the LED pin

//RotaryEncoder Pins
unsigned int A = 8;             // pins connected to the encoder (digital_pin 2)
unsigned int B = 9;             //              "                (digital_pin 3)
unsigned int ISRflag = 6;       //              "                (digital_pin 3)

//RFID Pins
const int rfid_irq = 0;
const int rfid_tx_pin = 2;
const int rfid_rx_pin = 7;


         int count = 0;         // count each indent
         int old_count = 0;     // check for count changed
const String VOLUME = "volume/";
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

// Setup of RFID
// For communication with RFID module
SoftwareSerial rfid(rfid_tx_pin, rfid_rx_pin);
 
// Indicates that a reading is now ready for processing
volatile bool ready = false;
 
// Buffer to contain the reading from the module
uint8_t buffer[14];
uint8_t* buffer_at;
uint8_t* buffer_end = buffer + sizeof(buffer);
 
void rfid_read(void);
uint8_t rfid_get_next(void);
unsigned long time;
unsigned long lasttime;
////////////////////////////////


// variables will change:
int buttonState_back = 0;         // variable for reading the pushbutton status
int buttonState_play = 0;         // variable for reading the pushbutton status
int buttonState_forward = 0;         // variable for reading the pushbutton status
int sentstate = 0;

void setup( ) {
    pinMode( A, INPUT );
    pinMode( B, INPUT );

    pinMode(ledPin, OUTPUT);      
  // initialize the pushbutton pin as an input:
    pinMode(buttonPin_back, INPUT);
    pinMode(buttonPin_play, INPUT);     
    pinMode(buttonPin_forward, INPUT);  


    MsTimer2::set( 1, T2_isr );             // interrupt polling:
    MsTimer2::start( );


    state = (digitalRead( A ) << 1) | digitalRead( B );     // Initialise state.
    old_count = 0;

    Serial.begin( 9600 );
    Serial.println( "Jukebox Input Module Online" );
    
    // Open software serial connection to RFID module
    //pinMode(rfid_tx_pin,INPUT);
    rfid.begin(9600);
 
    // Listen for interrupt from RFID module
    attachInterrupt(rfid_irq,rfid_read,FALLING);
    
    lasttime = 0L;
    time = 0L;
    
  
}


void T2_isr( ) {

    // Grab state of input pins.
    unsigned char pinstate = (digitalRead( A ) << 1) | digitalRead( B );

    // Determine new state from the pins and state table.
    state = ttable[state & 0x07][pinstate];

    if( state & DIR_CW )    count=count+10;        // count up for clockwise
    if( state & DIR_CCW )   count=count-10;        // count down for counterclockwise

}



void loop( ) {

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
        old_count = count;
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
    Serial.println("prev");
    sentstate = 1;
  } 
  else if ((buttonState_play == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("playpause");
    sentstate = 1;
  }
  else if ((buttonState_forward == HIGH) && (sentstate == 0)) {     
    // turn LED on:    
    digitalWrite(ledPin, HIGH);  
    Serial.println("next");
    sentstate = 1;
  }
  else if ((buttonState_back == LOW) && (buttonState_play == LOW) && (buttonState_forward == LOW)){
    // turn LED off:
    digitalWrite(ledPin, LOW); 
    sentstate = 0;
  }

//RFID
  if ( ready )
  {
    // Convert the buffer into a 32-bit value
    uint32_t result = 0;
    
    // Skip the preamble
    ++buffer_at;
    
    // Accumulate the checksum, starting with the first value
    uint8_t checksum = rfid_get_next();
    
    // We are looking for 4 more values
    int i = 4;    
    while(i--)
    {
      // Grab the next value
      uint8_t value = rfid_get_next();
      
      // Add it into the result
      result <<= 8;
      result |= value;
      
      // Xor it into the checksum
      checksum ^= value;
    }
    
    // Pull out the checksum from the data
    uint8_t data_checksum = rfid_get_next();
    
    // Print the result
    //Serial.print("Reading: ");
    //Serial.print(result);
 
    if ( checksum == data_checksum ) {
      if (lasttime > 0L) {
        time = millis();
        digitalWrite(ledPin, HIGH); 
        if ( time > (lasttime+2000L) ){
          Serial.println(time);
          Serial.println(lasttime);
          Serial.println(result);
          lasttime = millis();
        }
        result = 0;
        ready = false;
        digitalWrite(ledPin, LOW); 
      }
    }
    else {
      Serial.println(" CHECKSUM FAILED");
      ready = false;
    }
    lasttime = lasttime+1L;
     
    // We're done processing, so there is no current value    
    //ready = false;
  }


}

//helper functions for RFID
// Convert the next two chars in the stream into a byte and
// return that
uint8_t rfid_get_next(void)
{
  // sscanf needs a 2-byte space to put the result but we
  // only need one byte.
  uint16_t result;
 
  // Working space to assemble each byte
  static char byte_chars[3];
  
  // Pull out one byte from this position in the stream
  snprintf(byte_chars,3,"%c%c",buffer_at[0],buffer_at[1]);
  sscanf(byte_chars,"%x",&result);
  buffer_at += 2;
  
  return static_cast<uint8_t>(result);
}
 
void rfid_read(void)
{
  // Only read in values if there is not already a value waiting to be
  // processed
  if ( ! ready )
  {
    // Read characters into the buffer until it is full
    buffer_at = buffer;
    while ( buffer_at < buffer_end )
      *buffer_at++ = rfid.read();
      
    // Reset buffer pointer so it's easy to read out
    buffer_at = buffer;
  
    // Signal that the buffer has data ready
    ready = true;
  }
}

