// Part of my jukebox project
// Button control for an mipod-rest server running on localhost 
// mipod is a node.js module for controlling mpd via rest
// Arrow up -> louder
// Arrow down -> softer
// every second, query status and set global volume to indicated value

var keypress = require('keypress');
var rest = require('restler');
var host = 'http://localhost:10080'
var volume = ''

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// request status from mpd
// set global "volume" variable to whatever is given in the returned status
function getStatus(){
  rest.get(host+'/status').on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error:', result.message);
    } else {
      volume = result.volume
      console.log(volume);
    }
})}

// every second query status
setInterval(getStatus, 1000);


// call REST API to change the volume to the passed volume
function changeVol(v){
    rest.get(host+'/volume/'+v).on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
      } else {
        console.log(result);
        volume=v;
      }
    });
}


// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && key.name =='up'){
    console.log("key up")
    // if volume is smaller that 100, increase by 10. Else keep at 100
    var v = ((volume<100) ? volume+10 : 100)
    changeVol(v);
  }

  if (key && key.name =='down'){
    console.log("key down")
    // if volume is above 0 decrease by 10. Else keep at 0
    var v = ((volume>0) ? volume-10 : 0)
    changeVol(v)
  }
  if (key && key.name =='right'){
    console.log("key right")
    rest.get(host+'/next').on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
      } else {
        console.log(result);
      }
    });    
  }
  if (key && key.name =='left'){
    console.log("key left")
    rest.get(host+'/prev').on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
      } else {
        console.log(result);
      }
    });    
  }


  if (key && key.ctrl && key.name == 'c') {
    //somehow this does not work...
    process.exit;
  }
});



process.stdin.setRawMode(true);
process.stdin.resume();
