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
 
// Connect to the Arduino
// This will start searching for an Arduino and connect to it once one is found
 
function sendMessage(message) {
  console.log('sending message '+message+'.')
  request(mipodurl+message, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) 
     }
  })

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
        sendMessage(message);
      }
    })  
  }

  // RFID needs to be translated to name of playlist by playlistmapper
  if (message.startsWith('RFID')) {
    var arr = message.split(" ");
    console.log('rfidtag: '+arr[1])
    request(playlistmapperurl+'getplaylist/'+arr[1], function (error, response, body) {
       if (!error && response.statusCode == 200) {
          console.log(body)  
          reply = JSON.parse(body)
          if (reply.playlist.startsWith('N/A')) 
            return
          playPlaylist(reply.playlist)
       }
    })  
  }

  // everything else can be passed right on to mopidy
  else {
    sendMessage(message);
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
