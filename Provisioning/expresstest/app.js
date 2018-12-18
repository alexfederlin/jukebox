// app.js
const express = require('express');  
const app = express();  
const path = require('path');  
const bodyParser = require('body-parser');

const dirTree = require("directory-tree");


app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));

var datastore = '../database.db';
var Datastore = require('nedb');
var db = new Datastore({ filename: datastore, autoload: true });


/**
 * API
 */
app.get('/largemock',function(req,res){
  res.sendFile(path.join(__dirname+'/public/largemock.json'));
  //__dirname : It will resolve to your project folder.
});


//for a given path, return the rfid if already present in the db
app.get('/rfid', function(req, res, next) {  
    //console.log(req.query);
    db.find({playpath:req.query.path}, function(err,docs){
        let data = ""
        if (docs != ""){
            data = {
                rfid: docs[0].rfid
            };
        }
        else {
            data = {
                message: 'path '+JSON.stringify(req.query.path)+' not found in db'
            };   
        }
        res.status(200).send(data);
        
    });
});

//update the rfid for a path to the given value
//if the given rfid is already in use for another path, 
// return an error message incuding that path
// TODO: currently removing existing RFIDs is not supported
app.post('/rfid', function(req, res, next) {  
    //console.log("%s %O", "post to rfid received:", req);
    console.log("post to "+req.body.path+" - rfid received:", req.body.rfid);
    let data = "";
    // query a database and save data
    db.ensureIndex({fieldName:'rfid', unique: true});

    var docA = { "rfid":  req.body.rfid 
               , "playpath": req.body.path};


    db.insert(docA, function (err, newDoc) {
      if (err){
        db.find({rfid:req.body.rfid}, function(err,docs){
            if (docs != ""){
                data = "RFID "+req.body.rfid+" is already taken by path "+docs[0].playpath+". Try again"
                console.log(data);
                res.status(409).send(data);
            }
        })
      }
      else{
        console.log ("inserting data into DB: "+JSON.stringify(docA));
        data = docA;
        res.status(201).send(data);
      }
    });
});

//return the whole directory tree
app.get('/dirtree', function(req, res, next) {
    // create a directory tree with just directories - exclude all files  
    var tree = dirTree('/home/alex/Musik/jukebox/', {
      extensions: /\*/
    });
    // remove the static part of the path
    // do this by turning the JSON into a string...
    var strtree = JSON.stringify(tree);
    // .. replacing the static parts ...
    var repltree = strtree.replace(/\/home\/alex\/Musik\/jukebox\//g, '')
    // ... and then turn it back into a JSON
    let data = JSON.parse(repltree);
    res.status(200).send(data);
});
/**
 * STATIC FILES
 */
app.use('/', express.static('app'));

// Default every route except the above to serve the index.html
// app.get('*', function(req, res) {  
//     res.sendFile(path.join(__dirname + '/index.html'));
// });

module.exports = app;  