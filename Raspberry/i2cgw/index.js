var i2c = require('i2c')

var ADDR = 0x0a
var i2c1 = new i2c(ADDR, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface
var previous = 0
var count = 0

function poll() {
  i2c1.readByte(function (err, res){
    if (err) {
        console.log(err)
    }
    count += 1
    if (res == 2){
      if (previous == 2){
        console.log(count + ". pressed next");
      }
      previous = 2
    }
    if (res == 8){
      console.log(count + ". pressed play");
    }
    if (res == 32){
      console.log(count + ". pressed previous");
    }
    if (res == 0){
      if (previous == 0) {
        console.log(count + "released");
      }
      previous = 0
    }

    setTimeout(poll, 20);
  });
};

poll();

