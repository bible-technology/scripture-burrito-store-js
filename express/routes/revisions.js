'use strict';
var express = require('express');
var router = express.Router();

/* List of revisions for idServer/entry */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    res.render('revisions', {
	title: 'Revisions for ' + idServer + " / " + entry,
	idServer: idServer,
	entry: entry,
	revisions: store.entryRevisions(idServer, entry)
    });
});

module.exports = router;
