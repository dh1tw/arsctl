var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('rotators', {socket_port : settings.socketServer.port});
});

module.exports = router;