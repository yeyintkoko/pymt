var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('layouts/index', { title: 'Dashboard', loggedInUser: {name: 'Boyer'} });
});

module.exports = router;
