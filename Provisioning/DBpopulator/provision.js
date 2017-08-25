#!/usr/bin/env node
//////////////////////////////////////////////////////////////////////////////
//

// provision.js
// usage:
// provision <path/as/known/by/mpd> <RFID>
//
// this facilitates usage as stand-alone ad-hoc provisioning as well as 
// provisioning many directories in a loop (using an outside script
// calling this one)


var datastore = 'database.db'
var playpath = process.argv[2]
var rfid = process.argv[3]

if ( (playpath == null) || (rfid == null)) {
  console.log("Usage: "+path.basename(process.argv[1]) + " <path to directory as known by mpd> <RFID> [<path to database file>]");
  process.exit();
}

if (process.argv[4] != null){
  console.log ("datasore set to " + process.argv[4])
  const datastore = process.argv[3];
}

var Datastore = require('nedb')
  , db = new Datastore({ filename: datastore, autoload: true });

db.ensureIndex({fieldName:'rfid', unique: true});

var docA = { "rfid":  rfid 
           , "playpath": playpath};


db.insert(docA, function (err, newDoc) {
  if (err){
    console.log("This RFID is already taken. Try again");
  }
  else{
    console.log ("inserting data into DB: "+JSON.stringify(docA));
  }
});

