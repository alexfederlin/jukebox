var i2c = require('i2c')

var SegfaultHandler = require('segfault-handler');

SegfaultHandler.registerHandler("crash.log"); // With no argument, SegfaultHandler will generate a generic log file name
SegfaultHandler.registerHandler("crash.log", function(signal, address, stack) {
  console.log(stack);
	// Do what you want with the signal, address, or stack (array)
	// This callback will execute before the signal is forwarded on.
});

var ADDR_BTN = 0x0a
var ADDR_RTRY = 0x0b
try {
  var i2c1_btn = new i2c(ADDR_BTN, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface
  var i2c1_rtry = new i2c(ADDR_RTRY, {device: '/dev/i2c-1'});
} catch (err) {
  console.log("one of the i2c devices may not be connected: "+err);
}

var prev_vol = 0
var volume = 0

var previous = 0
var count = 0
var printed = 0
var blipcount = 0

function poll() {
try {
  i2c1_rtry.readByte(function (err, res){
  if (err) {
    console.log(err)
  }
    volume = Math.floor(res/2.55);
    if (volume != prev_vol) {
      if (((volume > prev_vol-5) && (volume < prev_vol+5)) || (blipcount > 5)){
        console.log(volume);
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
  });
}
catch(err) {
  console.log("reading from Rotary encoder failed: "+err);
}

try {
   i2c1_btn.readByte(function (err, res){
     if (err) {
         console.log(err)
     }
     count += 1
     if (res == 2){
       if ((previous == 2) && (printed == 0)){
         console.log(count + ". pressed next");
         printed = 1
       }
       previous = 2
     }
     if ((res == 8) && (printed == 0)){
       console.log(count + ". pressed play");
       printed = 1
     }
     if ((res == 32) && (printed ==0)){
       console.log(count + ". pressed previous");
       printed = 1
     }
     if (res == 0){
       if ((previous == 0) && (printed == 1)) {
         console.log(count + "released");
         printed = 0;
       }
       previous = 0
     }

     setTimeout(poll, 20);
   });
}
catch(err){
  console.log("Reading Buttons failed: "+err);
}

};

console.log ("starting");

poll();


