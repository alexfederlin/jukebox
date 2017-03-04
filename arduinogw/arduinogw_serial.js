// This is the main controlling component of the Jukebox.
// It listens to the input coming from the Arduino on the serial connection.
// The commands are  

var Arduino = require('arduino-interface');
var request = require('request');

const mipodurl = 'http://localhost:10081/'
const playlistmapperurl = 'http://localhost:4000/'
var arduino = new Arduino({
  baudrate: 9600,
  board: 'uno',
  nmea: true,
  debug: true
});
 
// Connect to the Arduino
// This will start searching for an Arduino and connect to it once one is found
arduino.connect();
 
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
});

arduino.on('disconnect', function() {
  console.log('Arduino serial connection closed. It will try to be reopened.');
});

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

arduino.on('data', function(message) {
  console.log('Data received: ' + message);
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