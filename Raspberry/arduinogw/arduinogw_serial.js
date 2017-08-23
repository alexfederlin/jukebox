// This is the main controlling component of the Jukebox.
// the actual playback of media files is handled by mpd, controlled through
// a REST interface provided by mopidy.
// This process listens to the input coming from the Arduino on the serial connection.
// The commands are partly passed on directly to mopidy, partly they are
// pre processed before the required requests are sent to mopidy

// there are three messages that can come from the Arduino
// 1. button presses
//    button presses can result in three different messages
//    - prev
//    - next
//    - playpause
//    The first two can be put through to the mipod server. Playpause first
//    needs to determine the current status of playback (play, stop, pause)
//    and will then send either 
//    - pause (if current status is play) 
//    - play (if current status is anything else)
// 2. Volume messages
//    volume messages are sent by the Arduino the form of volume/<value>
//    This is the format expected by mipod and can be sent straight on
// 3. RFID reads
//    If an RFID tag is scanned the message will look like: "RFID: <rfidTag>"
//    First of all, we need to figure out which playlist is connected to this
//    RFID tag. This is done by another server listening on the given port and
//    expects the RFID tag. It will reply with the appropriate playlist name
//    which will be sent to the mipod server

// Requirements:
// - mpd must be running and configured with playlists
// - mopidy must be running
// - playlistmapper must be running and configured to translate RFID tags to playlists present in mpd


var onoff = require('onoff');
var Gpio = onoff.Gpio,
    relais = new Gpio(4, 'out'); //RPi HW Pin 7

var SerialPort = require("serialport");
var arduino = new SerialPort("/dev/ttyACM0", {
  baudRate: 9600,
  parser: SerialPort.parsers.readline('\n')
});
var request = require('request');

const mipodurl = 'http://localhost:10081/'
const playlistmapperurl = 'http://localhost:4000/'

var mpd = require('mpd'),
    cmd = mpd.cmd
var client = mpd.connect({
  port: 6600,
  host: 'localhost',
});
client.on('ready', function() {
  console.log("ready");
});
client.on('system', function(name) {
  console.log("update", name);
});

client.on('system-player', function() {
  console.log("player update.");
  client.sendCommand(cmd("currentsong", []), function(err, msg){
    if (err) throw err;
    var track, artist, album, title;
    if (msg == '') return;
    var msgarray = msg.split('\n');
    console.log(msgarray);
    for (var j=0; j<msgarray.length; j++) {
      if (msgarray[j].match('Title')) title=msgarray[j].split(':')[1];
      if (msgarray[j].match('Track')) track=msgarray[j].split(':')[1];
      if (msgarray[j].match('Artist')) artist=msgarray[j].split(':')[1];
      if (msgarray[j].match('Album')) album=msgarray[j].split(':')[1];
    }
    var trackinfo = (track + "-"+artist+"-"+ album+"-"+title);
    console.log("track info: "+trackinfo);
    toArduino(trackinfo);
  });
})
 
// Connect to the Arduino
// This will start searching for an Arduino and connect to it once one is found
 
// function toMipod(message) {
//   console.log('sending message to mipod '+message+'.')
//   request(mipodurl+message, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log(body) 
//      }
//   })

// }

function toMipod(message) {
  console.log('sending message to mipod '+message+'.');
  client.sendCommand(cmd(message, []), function (err, msg) {
    if (err) throw err;
    console.log(msg);
  });
};

function toArduino(message) {
  console.log('sending message to Arduino '+message+'.');
  arduino.write(message);
}


arduino.on('connect', function() {
  console.log('Arduino connected.');
  relais.write(0, function() {
    console.log("Relais switched on");
  });
});

arduino.on('disconnect', function() {
  console.log('Arduino serial connection closed.');
});


arduino.on('data', function(message) {
  console.log('Data received: ' + message);

  // playpause toggle depends on current playback status
  if (message.startsWith('playpause')) {
    console.log('querying status')
    request(mipodurl+'status', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        stat = JSON.parse(body)
        message = (stat.state.startsWith('play')) ? 'pause' : 'play';
        console.log(stat.state, " --> ", message) 
        toArduino(message);
        toMipod(message);
      }
    })  
  }

  // RFID needs to be translated to name of playlist by playlistmapper
  else if (message.startsWith('RFID')) {
//    toMipod('add \"Geschichten/Bobo Siebenschlaefer\"');
    var arr = message.split(" ");
    var rfid = arr[1];
    console.log('rfidtag: '+ rfid)
    if (rfid >1000000 && rfid < 10000000) {
      rfidstring= "000" + rfid.toString(10);
    }

    //var req = playlistmapperurl+'getplaylist/'+arr[1];
    var req = playlistmapperurl+'getplaylist/'+rfidstring;
    console.log (req);
    request(req, function (error, response, body) {
       if (!error && response.statusCode == 200) {
          console.log(body)  
          reply = JSON.parse(body)
          if (reply.playlist) {
            if (reply.playlist.startsWith('N/A')) 
              return
            playPlaylist(reply.playlist)
          }
          if (reply.playpath) {
            if (reply.playpath.startsWith('N/A')) 
              return
            playPlaylist(reply.playpath)

          }
       }
    })  
  }

  else if (message.startsWith('I received')) {
    console.log ("feedback from Arduino received");
  }

  // everything else can be passed right on to mopidy
  else if (message.startsWith('CMD:')) {
    var m = message.replace(/^CMD: /, '')
    console.log ("sending to mipod: ", m)
    toMipod(m);
  }
});



function playPlaylist(playlist){
  url = mipodurl+"play";
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
