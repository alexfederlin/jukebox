#!/usr/bin/env node


var Datastore = require('nedb')
  , db = new Datastore({ filename: '/home/alex/Daten/Projekte/Development/jukebox/DBpopulator/database.db', autoload: true });

console.log("Touch RFID Tag to play.");

var HID = require('node-hid');

var device = new HID.HID('5050','24');
var resultarray = [];
var rfid = 0;

function onRead(error,data, callback){

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
    //console.log(rfid);
    //findPlaylist(rfid, playPlaylist);
    callback(rfid);
    resultarray = [];
    return;
  }
  device.read(onRead, doneYet);
}


device.read(onRead(doneYet));

function doneYet(rfid) {
	console.log("RFID read: "+rfid);
}


function findPlaylist(rfid, callback){
  var playlist;
  db.findOne({"rfid":rfid}, function (err, docs){
    if (err) {
      console.log('Error:', err);
    } else {
        console.log(docs);
        playlist= docs.playlist;
        console.log("returning playlist: "+playlist);
        callback(playlist);
    }
  });
}

function playPlaylist(playlist){
  var request = require('request');
  var host ="localhost"
  var port ="10081"
  url = "http://localhost:10081/play";
  requestData = { "entry" : playlist };
  
  console.log("start playing playlist "+playlist);
  
  request({
      url: url,
      method: "POST",
      json: requestData
    }, reportStatus);

}

function reportStatus (error, response, body) {
    if (error){
      console.log(error);
      return;
    }
    console.log("starting to play: "+response.statusCode);
}
