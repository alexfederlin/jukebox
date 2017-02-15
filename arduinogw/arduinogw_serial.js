var Arduino = require('arduino-interface');
var request = require('request');

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
  console.log('sending message ',message,'.')
  request('http://localhost:10081/'+message, function (error, response, body) {
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
arduino.on('data', function(message) {
  console.log('Data received: ' + message);
  if (message.startsWith('playpause')) {
    console.log('querying status')
    request('http://localhost:10081/status', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        stat = JSON.parse(body)
        message = (stat.state.startsWith('play')) ? 'pause' : 'play';
        console.log(stat.state, " --> ", message) 
        sendMessage(message);
      }
    })  
  }
  else {
    sendMessage(message);
  }
});
