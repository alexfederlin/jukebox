
/*
 *      rotary_sm.ino   --  State machine implementation of rotary encoder driver
 *                          Interrupt driven; supports 2 types of interrupts:
 *                            * Polled interrupts; enable by defining TIMER2INT
 *                            * Pin change interrupts: enalbe by defining PINCHANGEINT
 *                              (Do NOT enable both at the same time)
 *
 *          This program is developed from the code at: 
 *              http://www.buxtronix.net/2011/10/rotary-encoders-done-properly.html
 *          Since this code was in the form of an arduino library, and I had unresolvable
 *          references that I could not figure out, I just modified it as a single sketch.
 *          The only library support required is if you want to use interrupt polling,
 *          and then the MsTimer2 library needs to be installed.
 */

/* Define PINCHANGEINT if you want to interrupt on any encoder pin change */
//#define PINCHANGEINT
/* --- OR --- */
/* Define TIMER2INT if you want to use periodic interrupts to poll the encoder */
#define TIMER2INT

/* Define ENABLEPULLUPS if there are no external pull-ups on encoder AB pins */
//#define ENABLEPULLUPS

/* Define to enable the ISR debug flag */
//#define ISRFLAG


/* You may need to install this library (MsTimer2) from the arduino site */
#ifdef TIMER2INT
#include    <MsTimer2.h>
#endif


#define DIR_NONE 0x00           // No complete step yet.
#define DIR_CW   0x10           // Clockwise step.
#define DIR_CCW  0x20           // Anti-clockwise step.

unsigned int state;
unsigned int A = 8;             // pins connected to the encoder (digital_pin 2)
unsigned int B = 9;             //              "                (digital_pin 3)
unsigned int ISRflag = 5;       //              "                (digital_pin 3)
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


const int buttonPin_back = 2;     // the number of the pushbutton pin
const int buttonPin_play = 3;     // the number of the pushbutton pin
const int buttonPin_forward = 4;     // the number of the pushbutton pin
const int ledPin =  13;      // the number of the LED pin

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

#ifdef ENABLEPULLUPS
    digitalWrite( A, HIGH );                // set pullups
    digitalWrite( B, HIGH );                //      "
#endif

#ifdef TIMER2INT
    MsTimer2::set( 1, T2_isr );             // interrupt polling:
    MsTimer2::start( );
#endif

#ifdef PINCHANGEINT
    attachInterrupt( 0, AB_isr, CHANGE );   // pin-change interrupts: 
    attachInterrupt( 1, AB_isr, CHANGE );
#endif

#ifdef ISRFLAG
    pinMode( ISRflag, OUTPUT );             // time the ISR
    digitalWrite( ISRflag, HIGH );          // set pull-up ON
#endif

    state = (digitalRead( A ) << 1) | digitalRead( B );     // Initialise state.
    old_count = 0;

    Serial.begin( 9600 );
    Serial.println( "Rotary Encoder Tests" );
}


#ifdef PINCHANGEINT
void AB_isr( ) {
    // Grab state of input pins.
    unsigned char pinstate = (digitalRead( A ) << 1) | digitalRead( B );

    // Determine new state from the pins and state table.
    state = ttable[state & 0x07][pinstate];

    if( state & DIR_CW )    count++;
    if( state & DIR_CCW )   count--;
}
#endif


#ifdef TIMER2INT
void T2_isr( ) {

#ifdef ISRFLAG
    digitalWrite( ISRflag, HIGH );
#endif

    // Grab state of input pins.
    unsigned char pinstate = (digitalRead( A ) << 1) | digitalRead( B );

    // Determine new state from the pins and state table.
    state = ttable[state & 0x07][pinstate];

    if( state & DIR_CW )    count=count+10;        // count up for clockwise
    if( state & DIR_CCW )   count=count-10;        // count down for counterclockwise

#ifdef ISRFLAG
    digitalWrite( ISRflag, LOW );
#endif
}
#endif


void loop( ) {
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
        
}
