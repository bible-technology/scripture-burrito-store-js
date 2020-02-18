'use strict';
var express = require('express');
var router = express.Router();

/* List of revisions variants for idServer/entry */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    res.render('revisionsvariants', {
	title: 'Revisions for ' + idServer + " / " + entry + ' (2 level)',
	idServer: idServer,
	idServerName: store.idServerName(idServer),
	entry: entry,
	revisions: store.entryRevisionsVariants(idServer, entry)
    });
});

module.exports = router;
