var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.login){
    res.redirect("/login");
  } else 
    res.sendFile(path.join(__dirname, '../views/main_page.html'));
});

module.exports = router;
