'use strict';
var express = require('express');
var router = express.Router();

/* Variant info for idServer/entry/revision/variant */
router.get('/', function(req, res, next) {
    const app = req.app;
    const store = app.__burrito.store;
    const idServer = req.query.idserver;
    const entry = req.query.entry;
    const revision = req.query.revision;
    const variant = req.query.variant;
    res.render('variant', {
	title: 'Variant ' + variant + " of " + idServer + " / " + entry + " / " + revision,
	idServer: idServer,
	entry: entry,
	revision: revision,
	variant: variant,
	metadata: store.metadataContent(idServer, entry, revision, variant)
    });
});

module.exports = router;
