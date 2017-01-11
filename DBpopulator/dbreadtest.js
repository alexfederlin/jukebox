#!/usr/bin/env node


var Datastore = require('nedb')
  , db = new Datastore({ filename: '/home/alex/Daten/Projekte/Development/jukebox/DBpopulator/database.db', autoload: true });

console.log("Touch RFID Tag to play.");

var HID = require('node-hid');

var device = new HID.HID('5050','24');
var resultarray = [];
var rfid = 0;

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
    rfid = resultarray.join('').slice(-10);
    console.log(rfid);
    findPlaylist(rfid);
    resultarray = [];
    return;
  }
  device.read(onRead);
}


device.read(onRead);



function findPlaylist(rfid){
  var request = require('request');

  db.findOne({"rfid":rfid}, function (err, docs){
    if (err) {
      console.log('Error:', err);
    } else {
        console.log(docs);
        console.log("calling localhost:10081/play/"+docs.playlist)
        request('http://localhost:10081/play', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
          }
        })
    }
  });
}
