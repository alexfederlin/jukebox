var express = require('express')
var app = express()
var port = 4000

var Datastore = require('nedb')
  db = new Datastore({ filename: '/home/alex/Daten/Projekte/Development/jukebox/DBpopulator/database.db', autoload: true });


app.get('/play/:rfid', RespondToPlay);


app.get('/getplaylist/:rfid', RespondToGetPlaylist);

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!')
})

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
      res.send(JSON.stringify(reply))
    }
    else {
      res.send(JSON.stringify(reply))
    }
  })
}

function RespondToPlay (req, res) {
  var reply =('Playing playlist associated with RFID tag '+req.params.rfid+'!')
  db.findOne({"rfid":req.params.rfid}, function (err, docs){
    if (err) {
      console.error(err)
      return
    }
    if ( typeof docs !== 'undefined' && docs ) {
      res.send(reply + 'which is: '+docs.playlist)
      playPlaylist(docs.playlist)
    }
    else {
      res.send(reply + 'which is not defined in DB')
    }
  })
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
