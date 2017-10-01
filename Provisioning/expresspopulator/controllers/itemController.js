// read db (access to filesystem)
// read file system (access to filesystem)
// create web view with path and assigned RFID for matching path, empty text boxes for the rest
// on form submission update db according to changes

var dir = require('node-dir');
const sortBy = require('sort-array')
var subdirs = [];
var subrfid = [];
var datastore = '../database.db'
var Datastore = require('nedb')
  , db = module.exports =new Datastore({ filename: datastore, autoload: true });
var itemsToBeProcessed = 0;


//for each subdir found, call "populateSubrfid"
function goThroughSubdirs(err, subdirs) {
    console.log ("goThroughSubdirs");
    if (err) throw err;
    subdirs.forEach(populateSubrfid); 
}


//define a new object with a path relative to jukebox folder
//name is needed since the sorting algorithm sorts case sensitive, so make everything lower case to have alphabetical sorting
function populateSubrfid(item, index, array) {
      // use let instead of var to have individual obj objects in the closure below
      let obj = {
        'name': item.toLowerCase().replace('/home/alex/musik/jukebox/',''),
        'path': item.replace('/home/alex/Musik/jukebox/',''),
        'rfid': null
      };
      //console.log ("looking for " +  obj.path);

      // define a closure (I have no idea what I'm doing) as callbackfor the db.find call below
      function cl(err,docs){
        if (err) throw err;
        if (docs.length == 0) {
            subrfid.push(obj);
            return;
        }
//        console.log("MATCH!!! : "+docs[0].playpath);
//        console.log("setting rfid: " + docs[0].rfid);
//        console.log("on object:" + JSON.stringify(obj))
        obj.rfid = docs[0].rfid;
//        console.log("result:" + JSON.stringify(obj))

        subrfid.push(obj);

        itemsToBeProcessed--;
        console.log("items: " + itemsToBeProcessed)
        if(itemsToBeProcessed === 0) {
          createForm(subrfid);
        }
      }

      db.find({playpath:obj.path}, cl);

}

exports.item_list = function(req, res, app) {
    
    
      //find amount of entries in DB which have any content in the "playpath" (i.e. exluding the playlist entries)
    app.db.count({playpath : /.*/ }, function (err, count) {
        // still confused about asynchronizity, I guess. Using += so that even if this is populated while the 
        // loop below has already started decreasing this variable, in the end it will still be 0.
        itemsToBeProcessed += count;
        //res.send("items: "+ itemsToBeProcessed + "count: "+count)
    });

    // entry command. Once all subdirs are found, run the "goThroughSubdirs callback"
    dir.subdirs("/home/alex/Musik/jukebox", goThroughSubdirs);

    

};

//this is where we need to create a web form  from teh array and serve it out
function createForm (subrfid) {
    subrfid.forEach(item => console.log(item.path + ' - ' + item.rfid))
    res.send(sortBy(subrfid, 'name'));
}
