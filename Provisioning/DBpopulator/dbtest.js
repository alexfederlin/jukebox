#!/usr/bin/env node

var playlist = process.argv[2]

if ( playlist== null) {
  console.log("Usage: "+process.argv[1] + " <playlist>");
  process.exit();
}

console.log("Touch RFID Tag for playlist "+playlist);

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
    rfid = resultarray.join('');
    console.log(rfid);
    writeToDB(rfid);
    resultarray = [];
    return;
  }
  device.read(onRead);
}


device.read(onRead);

function writeToDB(rfid){
    console.log(rfid);

  var Datastore = require('nedb')
    , db = new Datastore({ filename: '/home/alex/Daten/Projekte/Development/jukebox/DBpopulator/database.db', autoload: true });

  db.ensureIndex({fieldName:'rfid', unique: true}, function (err){
    console.log(err)
  });

  var docA = { "rfid":  rfid 
             , "playlist": playlist};

  console.log ("inserting JSON into DB: "+JSON.stringify(docA));

  db.insert(docA, function (err, newDoc) {
    if (err){
      console.log("This RFID is already taken");
      return;
    }
    console.log(newDoc);
  });
};

