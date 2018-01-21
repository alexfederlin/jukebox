var i2c = require('i2c-bus'),
  i2c1;


var ADDR_RFID = 0x14
var buffer = new ArrayBuffer(4); // buffer holding just the RFID Tag
var uint8 = new Uint8Array(7); // buffer holding RFID Tag + delimiter sequence 0 255 0
var uint8_analyze = new Uint8Array(buffer); //8bit int view on the RFID tag (needs to be reordered)
var uint32_analyze = new Uint32Array(buffer); // 32 bit int view on the RFID Tag

i2c1 = i2c.openSync(1);

function analyze(){

  // console.log("data: " + uint8_analyze[0] + " " + uint8_analyze[1] + " " + uint8_analyze[2] + " " + uint8_analyze[3])
  // console.log("data: " + (uint8_analyze[0]).toString(2) + " " + (uint8_analyze[1]).toString(2) + " " + (uint8_analyze[2]).toString(2) + " " + (uint8_analyze[3]).toString(2));

  // we are reversing the order of the 4 byte array which holds the RFID tag
  // then we interpret the whole array as one big number, which happens to be 
  // exactly the RFID Tag we are after
  uint8_analyze.reverse();
  console.log("RFID: " + uint32_analyze[0]);
}

function poll() {

  // every time we get something new from the i2c bus, we basically shift
  // the array and put the new value at the end. As there is no shift and
  // push with typed arrays, we have to do it manually
  uint8.copyWithin(0,1); // shift
  uint8[uint8.length-1] = i2c1.receiveByteSync(ADDR_RFID); // push
  //console.log("data: " + uint8[0] + " " + uint8[1] + " " + uint8[2] + " " + uint8[3] + " " + uint8[4] + " " + uint8[5] + " " + uint8[6])
 
  // the ATTiny is sending a delimiter sequence of 0 255 0 between RFID tags
  // only if we detect this delimiter sequence at the beginning of the array
  // we will trigger the analyzing function.

  if ((uint8[0]==0)&&(uint8[1] == 255) && (uint8[2] == 0)) {
    for (var j=0; j<uint8_analyze.length; j++){
      uint8_analyze[j] = uint8[j+3];
    }
    analyze();
  }

  setTimeout(poll, 50);
}

poll();
