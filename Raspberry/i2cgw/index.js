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
    if ((res == 48) | (res==97)){
        if (previous != 48){
            count += 1
            console.log(count + ". pressed: "+res);
            
        }
        previous=48;
    }
    else {
        if (previous != 0) {
            console.log(count + ". released: "+res)
        }
        else {
            //console.log ("idle "+res)
        }
        previous = 0;

    }
    poll();
  });
};

poll();

