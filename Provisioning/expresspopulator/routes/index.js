var express = require('express');
var router = express.Router();
//var app = require('../app');
var path    = require("path");

// Require controller modules
var item_controller = require('../controllers/itemController');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

console.log ("item controler:" + item_controller)
console.log ("----------------")
//console.log ("app: "+app)


router.get('/items', function(req, res, next){
    item_controller.item_list(req, res, next)
    //res.render('index', { title: 'Express' });
});

router.put('/item', function(req, res, next){
    item_controller.update(req, res, next)
    //res.render('index', { title: 'Express' });
});

router.get('/test',function(req,res){
  res.sendFile(path.join(__dirname+'/../public/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/mock',function(req,res){
  res.sendFile(path.join(__dirname+'/../public/mock.json'));
  //__dirname : It will resolve to your project folder.
});

router.get('/largemock',function(req,res){
  res.sendFile(path.join(__dirname+'/../public/largemock.json'));
  //__dirname : It will resolve to your project folder.
});


router.get('/vue.js',function(req,res){
  res.sendFile(path.join(__dirname+'/../public/javascripts/vue.js'));
  //__dirname : It will resolve to your project folder.
});
module.exports = router;
