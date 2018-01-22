var i2c = require('i2c-bus'),
  i2c1;


// I2C Addresses
var ADDR_BTN = 0x0a
var ADDR_RTRY = 0x0b
var ADDR_LCD = 0x3f
var ADDR_RFID = 0x14

// open I2C and scan
i2c1 = i2c.openSync(1);
i2c1.scan(cb);

// RFID Stuff
var buffer = new ArrayBuffer(4); // buffer holding just the RFID Tag
var uint8 = new Uint8Array(7); // buffer holding RFID Tag + delimiter sequence 0 255 0
var uint8_analyze = new Uint8Array(buffer); //8bit int view on the RFID tag (needs to be reordered)
var uint32_analyze = new Uint32Array(buffer); // 32 bit int view on the RFID Tag
var lastRFID=0;

// Volume Stuff
var prev_vol = 0
var volume = 0

// Button Stuff
var previous = 0
var count = 0
var printed = 0
var blipcount = 0

// LCD Stuff
var LCD = require('lcdi2c');
var lcd = new LCD( 1, ADDR_LCD, 16, 2 );
lcd.clear();
lcd.on();




function cb(err,devices){
  if (err){
    console.log(err)
  }
  console.log("Devices on the i2c bus:");
  devices.forEach (function (device) {
    console.log("0x"+device.toString(16));
  });
}

function cbBtn(err,res){
  if (err) {
     console.log(err)
  }
  count += 1
  if (res == 2){
   if ((previous == 2) && (printed == 0)){
     console.log(count + ". pressed next");
     try{
       lcd.clear()
       lcd.println( 'Next');
     } catch (err) {
       console.log(err)
     }

     printed = 1
   }
   previous = 2
  }
  if ((res == 8) && (printed == 0)){
   console.log(count + ". pressed play");
   printed = 1
   try{
     lcd.clear()
     lcd.println( 'Play');
   } catch (err) {
     console.log(err)
   }


  }
  if ((res == 32) && (printed ==0)){
   console.log(count + ". pressed previous");
   printed = 1
   try{
     lcd.clear()
     lcd.println( 'Previous');
   } catch (err) {
     console.log(err)
   }

  }
  if (res == 0){
   if ((previous == 0) && (printed == 1)) {
     console.log(count + "released");
     printed = 0;
   }
   previous = 0
  }
};

function cbRtry(err,res){
  if (err) {
    console.log(err)
  }
    volume = Math.floor(res/2.55);
    if (volume != prev_vol) {
      if (((volume > prev_vol-5) && (volume < prev_vol+5)) || (blipcount > 5)){
        console.log(volume);
        try {
          lcd.clear()
          lcd.println( "Volume: " + volume );
        } catch (err) {
          console.log(err)
        }

        prev_vol = volume;
        blipcount = 0;
      }
      else console.log("blip: "+volume);
      blipcount += 1;
    }
    else {
      blipcount = 0;
    }
    //setTimeout(poll, 500);
};

function cbRFID(){

  // we are reversing the order of the 4 byte array which holds the RFID tag
  // then we interpret the whole array as one big number, which happens to be
  // exactly the RFID Tag we are after
  uint8_analyze.reverse();

  // only display RFID tag if it changed
  if (lastRFID != uint32_analyze[0]) {
    console.log("RFID: " + uint32_analyze[0]);
    lcd.clear()
    lcd.println( "RFID: " + uint32_analyze[0] );
    lastRFID = uint32_analyze[0];
  }
}


function poll() {
  try{
    i2c1.receiveByte(ADDR_RTRY, cbRtry)
    i2c1.receiveByte(ADDR_BTN, cbBtn)

  }
  catch(err){
    console.log("issue with reading from buttons or rotary enccoder: "+err)
  }
// read RFID
  // every time we get something new from the i2c bus, we basically shift
  // the array and put the new value at the end. As there is no shift and
  // push with typed arrays, we have to do it manually
  uint8.copyWithin(0,1); // shift
  try {
    uint8[uint8.length-1] = i2c1.receiveByteSync(ADDR_RFID); // push
  }
  catch(err){
    //console.log("issue with reading from RFID: "+err);
  }
  //console.log("data: " + uint8[0] + " " + uint8[1] + " " + uint8[2] + " " + uint8[3] + " " + uint8[4] + " " + uint8[5] + " " + uint8[6])

  // the ATTiny is sending a delimiter sequence of 0 255 0 between RFID tags
  // only if we detect this delimiter sequence at the beginning of the array
  // we will trigger the analyzing function.
  if ((uint8[0]==0)&&(uint8[1] == 255) && (uint8[2] == 0)) {
    for (var j=0; j<uint8_analyze.length; j++){
      uint8_analyze[j] = uint8[j+3];
    }
    cbRFID();
  }

  setTimeout(poll, 20);
}

poll();
