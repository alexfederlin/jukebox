
exports.onread = function (error,data){

  var resultarray = [];
  var rfid = 0;

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
    rfid = resultarray.join('').slice(-10);
    console.log(rfid);
    findPlaylist(rfid, playPlaylist);
    resultarray = [];
    return;
  }
  device.read(onRead);
};
