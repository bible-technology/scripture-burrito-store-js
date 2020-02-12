'use strict';
var express = require('express');
var router = express.Router();

/* GET two-level home page. */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    res.render('twolevel', {
	title: 'ID Servers (2 level)',
	servers: store.idServersEntries()
    });
});

module.exports = router;
