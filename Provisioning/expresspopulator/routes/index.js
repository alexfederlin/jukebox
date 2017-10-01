var express = require('express');
var router = express.Router();
var app = require('../app');

// Require controller modules
var item_controller = require('../controllers/itemController');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});

router.get('/',item_controller.item_list(app));

module.exports = router;
