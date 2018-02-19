// This is the main controlling component of the Jukebox with ATTinys.
// The actual playback of media files is handled by mpd.
// This process listens to the input coming from the ATTinys on the I2C connection.
// The commands are pre processed before the required requests are sent to mpd

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



var i2c = require('i2c-bus'),
  i2c1;


// I2C Addresses
var ADDR_BTN = 0x0a
var ADDR_RTRY = 0x0b
var ADDR_LCD = 0x3f
var ADDR_RFID = 0x14

// open I2C and scan
i2c1 = i2c.openSync(1);
i2c1.scan(cb);

// RFID Stuff
var buffer = new ArrayBuffer(4); // buffer holding just the RFID Tag
var uint8 = new Uint8Array(7); // buffer holding RFID Tag + delimiter sequence 0 255 0
var uint8_analyze = new Uint8Array(buffer); //8bit int view on the RFID tag (needs to be reordered)
var uint32_analyze = new Uint32Array(buffer); // 32 bit int view on the RFID Tag
var rfid = 0 // convenience variable
var lastRFID=0;
var rfidcount = 0;

// Volume Stuff
var prev_vol = 0
var volume = 0

// Button Stuff
var previous = 0
var count = 0
var printed = 0
var blipcount = 0

// LCD Stuff
var LCD = require('lcdi2c');
var lcdinit = false;
var lcd = new LCD( 1, ADDR_LCD, 16, 2 );

lcd.clear();
lcd.on();

// mpd stuff
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
    lcdWrite(trackinfo);
  });
})

function lcdWrite(message){
  lcd.clear()
  lcd.println(message);
}

function cb(err,devices){
  if (err){
    log(err)
  }
  log("Devices on the i2c bus:");
  devices.forEach (function (device) {
    log("0x"+device.toString(16));
  });
}

function log(str){
  console.log(new Date().toISOString().replace(/T/, ' ') +" - " + str); 
}

function toMpd(message) {
  log('sending message to mpd: '+message);
  client.sendCommand(cmd(message, []), function (err, msg) {
    if (err) console.log(err);
//    console.log("response from mpd: "+ msg);
  });
};

function resolvePlaylist (error, response, body) {
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
};

function playPlaylist(playlist){
  var command="add \""+playlist+"\"";
  toMpd("clear");
  toMpd(command);
  toMpd("play");
}

function reportStatus (error, response) {
    if (error){
      console.log(error);
      return;
    }
    console.log("status: "+response);
}

function cbBtn(err,res){
  if (err) {
     log(err)
  }
  count += 1
  if (res == 2){
   if ((previous == 2) && (printed == 0)){
     log(count + ". pressed next");
     try{
       toMpd("next")
       lcdWrite( 'Next');
     } catch (err) {
       log(err)
     }

     printed = 1
   }
   previous = 2
  }
  if ((res == 8) && (printed == 0)){
   log(count + ". pressed play");
   printed = 1
   try{
    client.sendCommand("status", function(error,response){
      if (error){
        console.log(error);
        return;
      }
      console.log(response);
      if (response.indexOf("state: play") > -1) {
        client.sendCommand("pause 1", reportStatus);
        console.log("pausing playback");
        lcdWrite("Pause");
      }
      else {
        client.sendCommand("play", reportStatus);
        console.log("resuming playback");
        lcdWrite("Play");
      }
    });

     // lcd.clear()
     // lcd.println( 'Play');
   } catch (err) {
     log(err)
   }


  }
  if ((res == 32) && (printed ==0)){
   log(count + ". pressed previous");
   printed = 1
   try{
     toMpd("previous")
     lcdWrite("Previous")
   } catch (err) {
     log(err)
   }

  }
  if (res == 0){
   if ((previous == 0) && (printed == 1)) {
     log(count + "released");
     printed = 0;
   }
   previous = 0
  }
};

function cbRtry(err,res){
  if (err) {
    log(err)
  }

// Usually, the Rotary Encoder provides values between 0 and 254. However,
// since we wanted to have the switch functionality, we sacrifice half the resolution
// ATTiny toggles highest bit in byte in case switch is pressed on the rotary encoder
// This will trigger a reset of the display
  if (res>=128){
    if (lcdinit == false){
      lcd.init();
      lcd.clear()
      lcdinit = true
    }
    log ("switch pressed");
    res = res-128;
  }
  else {
    if (lcdinit == true) {
      volume = Math.floor(res/1.27);
      lcd.println( "Volume: " + volume );
    }
    lcdinit = false;
  }
    volume = Math.floor(res/1.27);
    if (volume != prev_vol) {
      if (((volume > prev_vol-5) && (volume < prev_vol+5)) || (blipcount > 5)){
        log(volume);
        try {
          toMpd("setvol " + volume);
          lcdWrite( "Volume: " + volume );
        } catch (err) {
          log(err)
        }

        prev_vol = volume;
        blipcount = 0;
      }
      else log("blip: "+volume);
      blipcount += 1;
    }
    else {
      blipcount = 0;
    }
    //setTimeout(poll, 500);
};

function cbRFID(){

  // we are reversing the order of the 4 byte array which holds the RFID tag
  // then we interpret the whole array as one big number, which happens to be
  // exactly the RFID Tag we are after
  uint8_analyze.reverse();
  rfid = uint32_analyze[0];
  // only display RFID tag if it changed
  if (lastRFID != rfid) {
    rfidcount++;
    if (rfidcount>1){
    // log("RFID: " + uint32_analyze[0]);
      log("RFID: " + rfid + " rfidcount " + rfidcount);

      //query playlistmapper for playlist matching the rfid tag
      var req = playlistmapperurl+'getplaylist/'+rfid;
      log (req);
      request(req, resolvePlaylist);

      lcdWrite( "RFID: " + rfid );
      lastRFID = rfid;
      rfidcount = 0;
    }
    else {
      log ("new RFID read for the first time: "+ rfid);
    }
  }
}

// Function polling the I2C Devices and reacting to the received info
function poll() {
  
// Trying to read from ATTIny controlling Rotary Encoder and Buttons
// I
  try{
    i2c1.receiveByte(ADDR_RTRY, cbRtry)
    i2c1.receiveByte(ADDR_BTN, cbBtn)

  }
  catch(err){
    log("issue with reading from buttons or rotary enccoder: "+err)
  }
// read RFID
  // every time we get something new from the i2c bus, we basically shift
  // the array and put the new value at the end. As there is no shift and
  // push with typed arrays, we have to do it manually
  uint8.copyWithin(0,1); // shift
  try {
    uint8[uint8.length-1] = i2c1.receiveByteSync(ADDR_RFID); // push
  }
  catch(err){
    //log("issue with reading from RFID: "+err);
  }
  //log("data: " + uint8[0] + " " + uint8[1] + " " + uint8[2] + " " + uint8[3] + " " + uint8[4] + " " + uint8[5] + " " + uint8[6])

  // the ATTiny is sending a delimiter sequence of 0 255 0 between RFID tags
  // only if we detect this delimiter sequence at the beginning of the array
  // we will trigger the analyzing function.
  if ((uint8[0]==0)&&(uint8[1] == 255) && (uint8[2] == 0)) {
    for (var j=0; j<uint8_analyze.length; j++){
      uint8_analyze[j] = uint8[j+3];
    }
    cbRFID();
  }

  setTimeout(poll, 20);
}

poll();
