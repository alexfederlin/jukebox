#!/usr/bin/env node
//////////////////////////////////////////////////////////////////////////////
//
//   FOR NOW THIS HAS TO BE EXECUTED AS ROOT / sudo.
//
//   This script expects the name of a playlist (as it is known to mpd).
//   Next it will expect a RFID tag to be scanned.
//   It will add that RFID to the DB with the given playlist.
//   RFID tags are unique in the DB, so trying to assign an RFID twice
//   will fail.
const path = require('path');

const datastore = '/home/alex/Daten/Projekte/Development/jukebox/Provisioning/DBpopulator/database.db';

var playlist = process.argv[2]

if ( playlist == null) {
  console.log("Usage: "+path.basename(process.argv[1]) + " \"<playlist as known by mpd>\"");
  process.exit();
}

console.log("Touch RFID Tag for playlist "+playlist);

var HID = require('node-hid');

// this works for the  cheap RFID scanner from amazon. 
// Check what you got with console.log('devices:', HID.devices());
var device = new HID.HID('5050','24');
var resultarray = [];
var rfid = 0;

function onRead(error,data){

  var hexdata=data.toString('hex').slice(4,6);
  var decdata=parseInt(hexdata,16);

// decode the strange hex numbers emitted by this device
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
    , db = new Datastore({ filename: datastore, autoload: true });

  db.ensureIndex({fieldName:'rfid', unique: true}, function (err){
    console.log(err)
  });

  var docA = { "rfid":  rfid 
             , "playlist": playlist};

  console.log ("inserting data into DB: "+JSON.stringify(docA));

  db.insert(docA, function (err, newDoc) {
    if (err){
      console.log("This RFID is already taken. Try again");
      device.read(onRead);
    }
    console.log(newDoc);
  });
};

