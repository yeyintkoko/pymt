var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/login', { title: 'Express' });
// });
//
// router.get('/dashboard', function(req, res, next) {
//   res.render('pages/dashboard', { title: 'Dashboard', loggedInUser: {name: 'Boyer'} });
// });

var AdminApi = require('./adminApi');
router.use(AdminApi);

var MobileApi = require('./mobileApi');
router.use('/api',MobileApi);

module.exports = router;
