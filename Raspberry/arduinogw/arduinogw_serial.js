// This is the main controlling component of the Jukebox.
// the actual playback of media files is handled by mpd.
// This process listens to the input coming from the Arduino on the serial connection.
// The commands are partly passed on directly to mpd, partly they are
// pre processed before the required requests are sent to mpd

// there are three messages that can come from the Arduino
// 1. button presses
//    button presses can result in three different messages
//    - prev
//    - next
//    - playpause
//    The first two can be put through to the mpd server. Playpause first
//    needs to determine the current status of playback (play, stop, pause)
//    and will then send either 
//    - pause (if current status is play) 
//    - play (if current status is anything else)
// 2. Volume messages
//    volume messages are sent by the Arduino the form of volume/<value>
//    This is the format expected by mpd and can be sent straight on
// 3. RFID reads
//    If an RFID tag is scanned the message will look like: "RFID: <rfidTag>"
//    First of all, we need to figure out which playlist is connected to this
//    RFID tag. This is done by another server listening on the given port and
//    expects the RFID tag. It will reply with the appropriate playlist name
//    which will be sent to the mipod server

// Requirements:
// - mpd must be running and configured with playlists
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
  client.sendCommand("status", function(err, msg){
    if (err) throw err;
    var position, playlistlength;
    if (msg == '') return;
    var msgarray = msg.split('\n');
//    console.log(msgarray);
    for (var j=0; j<msgarray.length; j++) {
      if (msgarray[j].match('song:')) position=msgarray[j].split(':')[1];
      if (msgarray[j].match('playlistlength:')) playlistlength=msgarray[j].split(':')[1];
    }
    var trackinfo = (position + " /" + playlistlength);
    console.log("track info: "+trackinfo);
    toArduino(trackinfo);
  });
})

//add leading 0's to RFID tag
function pad(n, width=11, z=0) {
  return (String(z).repeat(width) + String(n)).slice(String(n).length)
} 

function toMpd(message) {
  console.log('sending message to mpd: '+message);
  client.sendCommand(cmd(message, []), function (err, msg) {
    if (err) console.log(err);
//    console.log("response from mpd: "+ msg);
  });
};

function toArduino(message) {
  console.log('sending message to Arduino '+message+'.');
  arduino.write(message+"\r");
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

// This is where input from Arduino is handled
// input can be:
// - playpause
// - CMD: next
// - CMD: prev
// - CMD: volume
// - RFID:  scan
// - I reveived: echo of data sent to Arduino to display
arduino.on('data', function(message) {
  console.log('Data from Arduino: ' + message);

  // playpause toggle depends on current playback status
  if (message.startsWith('playpause')) {
    console.log('querying status')
    client.sendCommand("status", function(error,response){
      if (error){
        console.log(error);
      return;
      }
      console.log(response);
      if (response.indexOf("state: play") > -1) {
        client.sendCommand("pause 1", reportStatus);
        console.log("pausing playback");
        toArduino("pause");
      }
      else {
        client.sendCommand("play", reportStatus);
        console.log("resuming playback");
        toArduino("play");
      }
    });
  }

  // RFID needs to be translated to name of playlist by playlistmapper
  else if (message.startsWith('RFID')) {
    var arr = message.split(" ");
    var rfid = pad(arr[1]);
    console.log('rfidtag: '+ rfid)

    //var req = playlistmapperurl+'getplaylist/'+arr[1];
    var req = playlistmapperurl+'getplaylist/'+rfid;
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

  else if (message.startsWith('Arduino received')) {
    console.log ("feedback from Arduino received");
  }

  // everything else (volume, prev, next) can be passed right on to mpd
  else if (message.startsWith('CMD:')) {
    var m = message.replace(/^CMD: /, '')
    console.log ("sending to mpd: ", m)
    toMpd(m);
  }
});



function playPlaylist(playlist){

  var command="add \""+playlist+"\"";
  toMpd("clear");
  toMpd(command);
  toMpd("play");
//  client.sendCommand("clear");
//  client.sendCommand(command, reportStatus);
//  client.sendCommand("play");
  
//  console.log("sending command "+command);
}

function reportStatus (error, response) {
    if (error){
      console.log(error);
      return;
    }
    console.log("status: "+response);
}
