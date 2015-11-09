var express = require('express');
var router = express.Router();
//var debug = require('debug')('app:server');

var requirejs = require('requirejs');
var app_params = requirejs('../public/js/app/app_params');

/* GET users listing. */
router.all('/', function(req, res, next) {
  //console.log("req.body=", req.body, "req.query=", req.query);
  //or req.param('name')
  //debug("debug in users /");
  res.json(app_params);
});

module.exports = router;
