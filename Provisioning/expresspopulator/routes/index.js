var express = require('express');
var router = express.Router();
//var app = require('../app');

// Require controller modules
var item_controller = require('../controllers/itemController');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

console.log ("item controler:" + item_controller)
console.log ("----------------")
//console.log ("app: "+app)


router.get('/', function(req, res, next){
    item_controller.item_list(req, res, next)
    //res.render('index', { title: 'Express' });
});

module.exports = router;
