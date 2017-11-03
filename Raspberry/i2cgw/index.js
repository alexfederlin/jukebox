var i2c = require('i2c')

var ADDR = 0x0a
var i2c1 = new i2c(ADDR, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface
var previous = 0
var count = 0
var printed = 0

function poll() {
  i2c1.readByte(function (err, res){
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
};

console.log ("starting");

poll();

