'use strict';
var express = require('express');
var router = express.Router();

/* List of entries for idServer */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    res.render('entries', {
	title: 'Entries for ' + idServer,
	idServer: idServer,
	idServerName: store.idServerName(idServer),
	entries: store.entries(idServer)
    });
});

module.exports = router;
