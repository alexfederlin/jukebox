// playlistmapper
/////////////////
// this server handles the Database backend which stores the relation between 
// the RFID tags and the playlist names
// it exposes a REST interface which enables querying for a certain RFID tag.
// The reply is provided in the form of a JSON String including the RFID tag
// as well as the playlist name: {"rfid":"7616525","playlist":"plA"}

var express = require('express')
var app = express()
var port = 4000

var mpd = require('mpd'),
    cmd = mpd.cmd
var client = mpd.connect({
  port: 6600,
  host: 'localhost',
});
client.on('ready', function() {
  console.log("ready");
});


var Datastore = require('nedb')
//  db = new Datastore({ filename: '/home/alex/Daten/Projekte/Development/jukebox/DBpopulator/database.db', autoload: true });
  db = new Datastore({ filename: 'database.db', autoload: true });

app.get('/getplaylist/:rfid', RespondToGetPlaylist);

app.get('/getplaylists', RespondToGetPlaylists);

app.listen(port, function () {
  console.log('Playlistmapper listening on port '+port+'!')
})


//return the playlist associated to RFID tag passed in the request
function RespondToGetPlaylist(req, res) {
  var reply = {
    rfid: req.params.rfid,
    playlist: "N/A"
  }
  db.findOne({"rfid":req.params.rfid}, function (err, docs){
    if (err) {
      console.error(err)
      return
    }
    if ( typeof docs !== 'undefined' && docs ) {
      reply.playlist = docs.playlist
    }
    else {
      console.log ("RFID tag not found in DB. ")
    }
    res.send(JSON.stringify(reply))
    console.log ("sending out reply: ",JSON.stringify(reply))
  })
}


//
function RespondToGetPlaylists(req, res) {
    client.sendCommand(cmd("listplaylists",[]),function(err, msg) {
    if (err) throw err;
    console.log(msg);
    res.send(JSON.stringify(msg))
  });

}
