var express = require('express');
var router = express.Router();

/* GET users listing. */
router.all('/', function(req, res, next) {
  console.log("req.body=", req.body, "req.query=", req.query);
  //or req.param('name')
  res.json({a: 1});
});

module.exports = router;
