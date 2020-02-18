'use strict';
var express = require('express');
var router = express.Router();

/* List of variants for idServer/entry/revision */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    const revision = req.query.revision;
    res.render('variants', {
	title: 'Variants for ' + idServer + " / " + entry + " / " + revision,
	idServer: idServer,
	idServerName: store.idServerName(idServer),
	entry: entry,
	revision: revision,
	variants: store.entryRevisionVariants(idServer, entry, revision)
    });
});

module.exports = router;
