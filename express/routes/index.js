'use strict';
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    res.render('index', {
	title: 'ID Servers',
	serversExist: store.idServers().length > 0,
	defaultLang: "en",
	servers: store.idServersDetails(),
	upload: req.query.upload ? true : false

    });
});

module.exports = router;
