var i2c = require('i2c-bus'),
  i2c1;

var ADDR_BTN = 0x0a
var ADDR_RTRY = 0x0b
var ADDR_LCD = 0x3f


var prev_vol = 0
var volume = 0

var previous = 0
var count = 0
var printed = 0
var blipcount = 0


i2c1 = i2c.openSync(1);

i2c1.scan(cb);


var LCD = require('lcdi2c');
var lcd = new LCD( 1, ADDR_LCD, 16, 2 );
lcd.clear();
lcd.on();


function cb(err,devices){
  if (err){
    console.log(err)
  }
  console.log(devices);
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
       lcd.printlnBlock( 'Next');
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
     lcd.printlnBlock( 'Play');
   } catch (err) {
     console.log(err)
   }


  }
  if ((res == 32) && (printed ==0)){
   console.log(count + ". pressed previous");
   printed = 1
   try{
     lcd.clear()
     lcd.printlnBlock( 'Previous');
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
          lcd.printlnBlock( "Volume: " + volume );
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



function poll() {
  i2c1.receiveByte(ADDR_BTN, cbBtn)
  i2c1.receiveByte(ADDR_RTRY, cbRtry)
  setTimeout(poll, 50);
}

poll();
