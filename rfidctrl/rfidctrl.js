var HID = require('node-hid');

var device = new HID.HID('5050','24');
var resultarray = [];

device.read(onRead);

function onRead(error,data){

  var hexdata=data.toString('hex').slice(4,6);
  var decdata=parseInt(hexdata,16);

  if ((decdata > 29) && (decdata < 39)) {
    number= decdata-29;
    resultarray.push(number);
  }
  if (decdata == 39) {
    number = 0;
    resultarray.push(number);
  }
  if (decdata == 40) {
    result = resultarray.join('');
    console.log(result);
    resultarray = [];

    number = 'newline';
  }


  if (hexdata != '00'){
//    console.log("\n" + hexdata + " = " + decdata + " : " + number);
  }
  device.read(onRead);

}

